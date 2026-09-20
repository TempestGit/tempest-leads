import {
  createCompanySchema,
  listCompaniesSchema,
  companyIdSchema,
  updateCompanySchema,
} from './companies.validation.js';

import {
  createCompany,
  listCompanies,
  findCompany,
  updateCompany,
} from './companies.service.js';

function duplicateResponse(res) {
  return res.status(409).json({
    message:
      'A company with this name already exists. Search for it or contact your administrator.',
    code: 'COMPANY_DUPLICATE',
  });
}

export async function index(req, res) {
  const result = listCompaniesSchema.safeParse(req.query);

  if (!result.success) {
    return res.status(400).json({
      message: 'Invalid search or pagination parameters.',
      errors: result.error.flatten().fieldErrors,
    });
  }

  res.json(await listCompanies(req.user, result.data));
}

export async function create(req, res) {
  const result = createCompanySchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      message: 'Please check the company information.',
      errors: result.error.flatten().fieldErrors,
    });
  }

  try {
    const company = await createCompany(req.user, result.data);

    res.status(201).json({
      message: 'Company created successfully.',
      data: company,
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return duplicateResponse(res);
    }

    throw error;
  }
}

export async function show(req, res) {
  const id = companyIdSchema.safeParse(req.params.id);

  if (!id.success) {
    return res.status(400).json({
      message: 'Invalid company ID.',
    });
  }

  const company = await findCompany(req.user, id.data);

  if (!company) {
    return res.status(404).json({
      message: 'Company not found or you do not have access.',
    });
  }

  res.json({ data: company });
}

export async function update(req, res) {
  const id = companyIdSchema.safeParse(req.params.id);
  const result = updateCompanySchema.safeParse(req.body);

  if (!id.success) {
    return res.status(400).json({
      message: 'Invalid company ID.',
    });
  }

  if (!result.success) {
    return res.status(400).json({
      message: 'Please check the company information.',
      errors: result.error.flatten().fieldErrors,
    });
  }

  try {
    const company = await updateCompany(
      req.user,
      id.data,
      result.data,
    );

    res.json({
      message: 'Company updated successfully.',
      data: company,
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return duplicateResponse(res);
    }

    if (
      ['COMPANY_NOT_FOUND', 'COMPANY_VERSION_CONFLICT'].includes(
        error.code,
      )
    ) {
      return res.status(error.status).json({
        message: error.message,
        code: error.code,
      });
    }

    throw error;
  }
}