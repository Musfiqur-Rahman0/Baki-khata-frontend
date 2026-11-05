const DATABASE_NAME = "baki-khata-offline";
const OUTBOX_STORE = "transactions";

export interface OutboxRecord {
  requestId: string;
  userId: string;
  input: unknown;
  transaction: Record<string, unknown>;
  createdAt: string;
  failed?: string;
}

function openOutbox(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, 1);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(OUTBOX_STORE)) {
        database.createObjectStore(OUTBOX_STORE, { keyPath: "requestId" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function runOutboxRequest<T>(
  mode: IDBTransactionMode,
  operation: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  const database = await openOutbox();
  return new Promise<T>((resolve, reject) => {
    const transaction = database.transaction(OUTBOX_STORE, mode);
    const request = operation(transaction.objectStore(OUTBOX_STORE));
    let result: T;
    request.onsuccess = () => {
      result = request.result;
    };
    request.onerror = () => reject(request.error);
    transaction.oncomplete = () => {
      database.close();
      resolve(result);
    };
    transaction.onerror = () => {
      database.close();
      reject(transaction.error);
    };
    transaction.onabort = () => {
      database.close();
      reject(transaction.error);
    };
  });
}

export function getOutbox(): Promise<OutboxRecord[]> {
  return runOutboxRequest("readonly", (store) => store.getAll());
}

export function putOutbox(record: OutboxRecord) {
  return runOutboxRequest("readwrite", (store) => store.put(record));
}

export function deleteOutboxRecord(requestId: string) {
  return runOutboxRequest("readwrite", (store) => store.delete(requestId));
}

export async function markOutboxFailed(requestId: string, message: string) {
  const records = await getOutbox();
  const record = records.find((item) => item.requestId === requestId);
  if (record) await putOutbox({ ...record, failed: message });
}

export async function clearOutboxFailure(requestId: string) {
  const records = await getOutbox();
  const record = records.find((item) => item.requestId === requestId);
  if (!record) return;
  const retryable = { ...record };
  delete retryable.failed;
  await putOutbox(retryable);
}
