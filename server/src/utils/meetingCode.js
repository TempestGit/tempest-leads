const generateMeetingCode = (
  meetingId
) => {
  const id =
    Number(
      meetingId
    );

  if (
    !Number.isInteger(id) ||
    id <= 0
  ) {
    throw new Error(
      "Invalid meeting ID."
    );
  }

  return `MET-${1000 + id}`;
};

export default generateMeetingCode;