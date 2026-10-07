import {
  createCompanyService,
  deleteCompanyService,
  getCompaniesService,
  getCompanyService,
  updateCompanyService,
} from "./companies.service.js";

const getRequestMetadata = (req) => ({
  ipAddress: req.ip || null,

  userAgent: req.get("user-agent") || null,
});

export const listCompaniesController = async (req, res) => {
  const result = await getCompaniesService(req.validated.query, req.user);

  res.status(200).json({
    success: true,
    data: result,
  });
};

export const getCompanyController = async (req, res) => {
  const { companyId } = req.validated.params;

  const company = await getCompanyService(companyId, req.user);

  res.status(200).json({
    success: true,

    data: {
      company,
    },
  });
};

export const createCompanyController = async (req, res) => {
  const company = await createCompanyService({
    data: req.validated.body,

    userId: req.user.id,

    ...getRequestMetadata(req),
  });

  res.status(201).json({
    success: true,

    message: "Company created.",

    data: {
      company,
    },
  });
};

export const updateCompanyController = async (req, res) => {
  const { companyId } = req.validated.params;

  const company = await updateCompanyService({
    companyId,

    data: req.validated.body,

    currentUser: req.user,

    userId: req.user.id,

    ...getRequestMetadata(req),
  });

  res.status(200).json({
    success: true,

    message: "Company updated.",

    data: {
      company,
    },
  });
};

export const deleteCompanyController = async (req, res) => {
  const { companyId } = req.validated.params;

  await deleteCompanyService({
    companyId,

    userId: req.user.id,

    ...getRequestMetadata(req),
  });

  res.status(200).json({
    success: true,

    message: "Company deleted.",
  });
};