export enum State {
  pending,
  success,
  failed
}
  
export interface Status {
  state: State,
  message: string
}