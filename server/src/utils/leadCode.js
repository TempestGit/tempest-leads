/*
|--------------------------------------------------------------------------
| Generate Lead Code
|--------------------------------------------------------------------------
|
| Database ID:
|
| 1  → LED-3001
| 2  → LED-3002
| 3  → LED-3003
|
*/

const generateLeadCode = (
  leadId
) => {
  const id =
    Number(leadId);

  if (
    !Number.isInteger(id) ||
    id <= 0
  ) {
    throw new Error(
      "Invalid lead ID."
    );
  }

  return `LED-${3000 + id}`;
};

export default generateLeadCode;