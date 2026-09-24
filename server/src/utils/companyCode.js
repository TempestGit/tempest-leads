/*
|--------------------------------------------------------------------------
| Generate Company Code
|--------------------------------------------------------------------------
|
| MySQL id:
|
| 1 → CMP-1001
| 2 → CMP-1002
| 3 → CMP-1003
|
*/

const generateCompanyCode = (
  companyId
) => {
  const id =
    Number(companyId);

  if (
    !Number.isInteger(id) ||
    id <= 0
  ) {
    throw new Error(
      "Invalid company ID."
    );
  }

  return `CMP-${1000 + id}`;
};

export default generateCompanyCode;