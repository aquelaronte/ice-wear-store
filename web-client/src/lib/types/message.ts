export type Message = {
  content: string;
  role: "AI" | "USER";
  createdAt?: Date;
};
