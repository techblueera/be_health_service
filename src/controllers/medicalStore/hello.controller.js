export const helloController = (req, res) => {
  res.status(200).json({
    message: "Hello from the be_grocery_service API!⚡",
  });
};
