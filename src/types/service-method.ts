export type ServiceMethod<DataType = unknown> = (
  ...args: unknown[]
) => Promise<
  | { success: false; status: number; message: string }
  | { success: true; data: DataType }
>;
