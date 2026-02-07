const { Prisma } = require("@prisma/client");

function errorMiddleware(err, req, res, next) {
  // Errores conocidos de Prisma
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2025") {
      return res.status(404).json({ error: "resource not found" });
    }
  }

  console.error(err);

  return res.status(500).json({
    error: "internal server error",
  });
}

module.exports = errorMiddleware;
