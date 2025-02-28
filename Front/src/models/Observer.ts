export interface Observer<T> {
    update(param?: T) : void;
}