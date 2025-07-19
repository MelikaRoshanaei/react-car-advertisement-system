export const validateCar = (req, res, next) => {
  let {
    name,
    brand,
    model,
    color,
    year,
    mileage,
    price,
    description,
    user_id,
    status,
  } = req.body;

  if (
    typeof name !== "string" ||
    !(name = name.trim()) ||
    name.length > 100 ||
    /^\d+$/.test(name)
  ) {
    return res.status(400).json({ error: "Valid Car Name Is Required!" });
  }

  if (
    typeof brand !== "string" ||
    !(brand = brand.trim()) ||
    brand.length > 50 ||
    /^\d+$/.test(brand)
  ) {
    return res.status(400).json({ error: "Valid Brand Is Required!" });
  }

  if (
    typeof model !== "string" ||
    !(model = model.trim()) ||
    model.length > 50 ||
    /^\d+$/.test(model)
  ) {
    return res.status(400).json({ error: "Valid Model Is Required!" });
  }

  if (
    typeof color !== "string" ||
    !(color = color.trim()) ||
    color.length > 30 ||
    /^\d+$/.test(color)
  ) {
    return res.status(400).json({ error: "Valid Color Is Required!" });
  }

  if (
    typeof year !== "number" ||
    !Number.isInteger(year) ||
    year < 1900 ||
    year > new Date().getFullYear()
  ) {
    return res.status(400).json({ error: "Valid Year Is Required!" });
  }

  if (typeof mileage !== "number" || mileage < 0) {
    return res.status(400).json({ error: "Valid Mileage Is Required!" });
  }

  if (typeof price !== "number" || price < 0) {
    return res.status(400).json({ error: "Valid Price Is Required!" });
  }

  if (description !== undefined && description !== null) {
    if (typeof description === "string") {
      description = description.trim();
      if (description === "") {
        description = null;
      } else if (description.length > 1000) {
        return res.status(400).json({ error: "Description Is Too Long!" });
      }
    } else {
      return res.status(400).json({ error: "Invalid Description Type!" });
    }
  }

  const allowedStatuses = ["active", "sold", "archived"];
  if (
    typeof status !== "string" ||
    status.trim() === "" ||
    !allowedStatuses.includes(status.trim())
  ) {
    status = "pending";
  } else {
    status = status.trim();
  }

  req.body = {
    name,
    brand,
    model,
    color,
    year,
    mileage,
    price,
    description,
    user_id,
    status,
  };
  next();
};

export const validateCarUpdate = (req, res, next) => {
  let { name, brand, model, color, year, mileage, price, description, status } =
    req.body;
  let orderIndex = 1;
  let queryFields = [];
  let values = [];

  if (name !== undefined) {
    if (
      typeof name !== "string" ||
      !(name = name.trim()) ||
      name.length > 100 ||
      /^\d+$/.test(name)
    ) {
      return res
        .status(400)
        .json({ error: "Please Provide a Valid Car Name!" });
    }
    queryFields.push(`name = $${orderIndex}`);
    values.push(name);
    orderIndex++;
  }

  if (brand !== undefined) {
    if (
      typeof brand !== "string" ||
      !(brand = brand.trim()) ||
      brand.length > 50 ||
      /^\d+$/.test(brand)
    ) {
      return res.status(400).json({ error: "Please Provide a Valid Brand!" });
    }
    queryFields.push(`brand = $${orderIndex}`);
    values.push(brand);
    orderIndex++;
  }

  if (model !== undefined) {
    if (
      typeof model !== "string" ||
      !(model = model.trim()) ||
      model.length > 50 ||
      /^\d+$/.test(model)
    ) {
      return res.status(400).json({ error: "Please Provide a Valid Model!" });
    }
    queryFields.push(`model = $${orderIndex}`);
    values.push(model);
    orderIndex++;
  }

  if (color !== undefined) {
    if (
      typeof color !== "string" ||
      !(color = color.trim()) ||
      color.length > 30 ||
      /^\d+$/.test(color)
    ) {
      return res.status(400).json({ error: "Please Provide a Valid Color!" });
    }
    queryFields.push(`color = $${orderIndex}`);
    values.push(color);
    orderIndex++;
  }

  if (year !== undefined) {
    if (
      typeof year !== "number" ||
      !Number.isInteger(year) ||
      year < 1900 ||
      year > new Date().getFullYear()
    ) {
      return res.status(400).json({ error: "Please Provide a Valid Year!" });
    }
    queryFields.push(`year = $${orderIndex}`);
    values.push(year);
    orderIndex++;
  }

  if (mileage !== undefined) {
    if (typeof mileage !== "number" || mileage < 0) {
      return res.status(400).json({ error: "Please Provide a Valid Mileage!" });
    }
    queryFields.push(`mileage = $${orderIndex}`);
    values.push(mileage);
    orderIndex++;
  }

  if (price !== undefined) {
    if (typeof price !== "number" || price < 0) {
      return res.status(400).json({ error: "Please Provide a Valid Price!" });
    }
    queryFields.push(`price = $${orderIndex}`);
    values.push(price);
    orderIndex++;
  }

  if (description !== undefined) {
    if (typeof description === "string") {
      description = description.trim();
      if (description === "") {
        description = null;
      } else if (description.length > 1000) {
        return res.status(400).json({ error: "Description Is Too Long!" });
      }
    } else {
      return res.status(400).json({ error: "Invalid Description Type!" });
    }
    queryFields.push(`description = $${orderIndex}`);
    values.push(description);
    orderIndex++;
  }

  const allowedStatuses = ["active", "sold", "archived"];
  if (status !== undefined) {
    if (
      typeof status !== "string" ||
      status.trim() === "" ||
      !allowedStatuses.includes(status.trim())
    ) {
      return res.status(400).json({ error: "Please Provide a Valid Status!" });
    }
    status = status.trim();
    queryFields.push(`status = $${orderIndex}`);
    values.push(status);
    orderIndex++;
  }

  if (queryFields.length === 0) {
    return res
      .status(400)
      .json({ error: "No Valid Field Provided For Update!" });
  }

  req.validatedData = { queryFields, values };
  next();
};

export const validateCarSearch = (req, res, next) => {
  let {
    name,
    brand,
    model,
    color,
    year,
    minYear,
    maxYear,
    price,
    minPrice,
    maxPrice,
    mileage,
    minMileage,
    maxMileage,
    status,
    sort,
    order,
  } = req.query;

  let orderIndex = 1;
  let queryFields = [];
  let values = [];

  if (name !== undefined) {
    if (
      !(name = name.trim()) ||
      name === "" ||
      name.length > 100 ||
      !/[a-zA-Z]/.test(name)
    ) {
      return res
        .status(400)
        .json({ error: "Please Provide a Valid Car Name!" });
    }
    queryFields.push(`name ILIKE $${orderIndex}`);
    values.push(`%${name}%`);
    orderIndex++;
  }

  if (brand !== undefined) {
    if (
      !(brand = brand.trim()) ||
      brand === "" ||
      brand.length > 50 ||
      !/[a-zA-Z]/.test(brand)
    ) {
      return res.status(400).json({ error: "Please Provide a Valid Brand!" });
    }
    queryFields.push(`brand ILIKE $${orderIndex}`);
    values.push(`%${brand}%`);
    orderIndex++;
  }

  if (model !== undefined) {
    if (
      !(model = model.trim()) ||
      model === "" ||
      model.length > 50 ||
      !/[a-zA-Z]/.test(model)
    ) {
      return res.status(400).json({ error: "Please Provide a Valid Model!" });
    }
    queryFields.push(`model ILIKE $${orderIndex}`);
    values.push(`%${model}%`);
    orderIndex++;
  }

  if (color !== undefined) {
    if (
      !(color = color.trim()) ||
      color === "" ||
      color.length > 30 ||
      !/[a-zA-Z]/.test(color)
    ) {
      return res.status(400).json({ error: "Please Provide a Valid Color!" });
    }
    queryFields.push(`color ILIKE $${orderIndex}`);
    values.push(`%${color}%`);
    orderIndex++;
  }

  if (year !== undefined) {
    year = Number(year);
    if (
      !Number.isInteger(year) ||
      year < 1900 ||
      year > new Date().getFullYear()
    ) {
      return res.status(400).json({ error: "Please Provide a Valid Year!" });
    }
    queryFields.push(`year = $${orderIndex}`);
    values.push(year);
    orderIndex++;
  }

  if (minYear !== undefined) {
    minYear = Number(minYear);
    if (
      !Number.isInteger(minYear) ||
      minYear < 1900 ||
      minYear > new Date().getFullYear()
    ) {
      return res
        .status(400)
        .json({ error: "Please Provide a Valid Min-Year!" });
    }
    queryFields.push(`year >= $${orderIndex}`);
    values.push(minYear);
    orderIndex++;
  }

  if (maxYear !== undefined) {
    maxYear = Number(maxYear);
    if (
      !Number.isInteger(maxYear) ||
      maxYear < 1900 ||
      maxYear > new Date().getFullYear()
    ) {
      return res
        .status(400)
        .json({ error: "Please Provide a Valid Max-Year!" });
    }
    queryFields.push(`year <= $${orderIndex}`);
    values.push(maxYear);
    orderIndex++;
  }

  if (price !== undefined) {
    price = Number(price);
    if (isNaN(price) || price <= 0) {
      return res.status(400).json({ error: "Please Provide a Valid Price!" });
    }
    queryFields.push(`price = $${orderIndex}`);
    values.push(price);
    orderIndex++;
  }

  if (minPrice !== undefined) {
    minPrice = Number(minPrice);
    if (isNaN(minPrice) || minPrice < 0) {
      return res
        .status(400)
        .json({ error: "Please Provide a Valid Min-Price!" });
    }
    queryFields.push(`price >= $${orderIndex}`);
    values.push(minPrice);
    orderIndex++;
  }

  if (maxPrice !== undefined) {
    maxPrice = Number(maxPrice);
    if (isNaN(maxPrice) || maxPrice < 0) {
      return res
        .status(400)
        .json({ error: "Please Provide a Valid Max-Price!" });
    }
    queryFields.push(`price <= $${orderIndex}`);
    values.push(maxPrice);
    orderIndex++;
  }

  if (mileage !== undefined) {
    mileage = mileage.trim();
    if (
      mileage === "" ||
      isNaN(mileage) ||
      !Number.isInteger(Number(mileage)) ||
      Number(mileage) < 0
    ) {
      return res.status(400).json({ error: "Please Provide a Valid Mileage!" });
    }
    mileage = Number(mileage);
    queryFields.push(`mileage = $${orderIndex}`);
    values.push(mileage);
    orderIndex++;
  }

  if (minMileage !== undefined) {
    minMileage = minMileage.trim();
    if (
      minMileage === "" ||
      isNaN(minMileage) ||
      !Number.isInteger(Number(minMileage)) ||
      Number(minMileage) < 0
    ) {
      return res
        .status(400)
        .json({ error: "Please Provide a Valid Min-Mileage!" });
    }
    minMileage = Number(minMileage);
    queryFields.push(`mileage >= $${orderIndex}`);
    values.push(minMileage);
    orderIndex++;
  }

  if (maxMileage !== undefined) {
    maxMileage = maxMileage.trim();
    if (
      maxMileage === "" ||
      isNaN(maxMileage) ||
      !Number.isInteger(Number(maxMileage)) ||
      Number(maxMileage) < 0
    ) {
      return res
        .status(400)
        .json({ error: "Please Provide a Valid Max-Mileage!" });
    }
    maxMileage = Number(maxMileage);
    queryFields.push(`mileage <= $${orderIndex}`);
    values.push(maxMileage);
    orderIndex++;
  }

  const allowedStatuses = ["active", "sold", "archived", "pending"];
  if (status !== undefined) {
    status = status.trim().toLowerCase();
    if (status === "" || !allowedStatuses.includes(status)) {
      return res.status(400).json({ error: "Please Provide a Valid Status!" });
    }
    queryFields.push(`status = $${orderIndex}`);
    values.push(status);
    orderIndex++;
  }

  const allowedSort = ["created_at", "year", "price", "mileage"];
  sort = sort ? sort.trim().toLowerCase() : "created_at";
  if (!allowedSort.includes(sort)) {
    return res.status(400).json({ error: "Please Provide a Valid Sort Type!" });
  }

  const allowedOrder = ["ASC", "DESC"];
  order = order ? order.trim().toUpperCase() : "ASC";
  if (!allowedOrder.includes(order)) {
    return res
      .status(400)
      .json({ error: "Please Provide a Valid Order Type!" });
  }

  if (queryFields.length === 0) {
    return res
      .status(400)
      .json({ error: "No Valid Field Provided For Search!" });
  }

  req.validatedData = { queryFields, values, sort, order };
  next();
};
