type Listener<T> = (state: T) => void;

export class MicroStore<T> {
  private listeners: Set<Listener<T>> = new Set();

  constructor(private state: T) {}

  getState(): T {
    return this.state;
  }

  setState(partial: Partial<T> | ((prev: T) => T)): void {
    if (typeof partial === 'function') {
      this.state = (partial as (prev: T) => T)(this.state);
    } else {
      this.state = { ...this.state, ...partial };
    }
    this.notify();
  }

  subscribe(listener: Listener<T>): () => void {
    this.listeners.add(listener);
    listener(this.state);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    for (const listener of this.listeners) {
      listener(this.state);
    }
  }
}
