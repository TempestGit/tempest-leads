/*
|--------------------------------------------------------------------------
| Generate Contact Code
|--------------------------------------------------------------------------
|
| MySQL id:
|
| 1  → CON-2001
| 2  → CON-2002
| 3  → CON-2003
|
*/

const generateContactCode = (
  contactId
) => {
  const id =
    Number(contactId);

  if (
    !Number.isInteger(id) ||
    id <= 0
  ) {
    throw new Error(
      "Invalid contact ID."
    );
  }

  return `CON-${2000 + id}`;
};

export default generateContactCode;