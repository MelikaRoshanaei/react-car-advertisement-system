const errorHandler = (err, req, res, next) => {
  console.error(err.message);
  res
    .status(500)
    .json({ error: "The Operation Failed!", details: err.message });
};

export default errorHandler;
