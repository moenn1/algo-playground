import type { FastifyReply } from "fastify";

export class HttpError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string
  ) {
    super(message);
    this.name = "HttpError";
  }
}

export function sendError(reply: FastifyReply, error: unknown) {
  if (error instanceof HttpError) {
    return reply.status(error.statusCode).send({
      error: error.message
    });
  }

  console.error(error);

  return reply.status(500).send({
    error: "Internal server error."
  });
}
