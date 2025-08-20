export const getName = (userNameWithDomainAndSessionId) => {
  const [name] = userNameWithDomainAndSessionId.split("@");
  return name;
};

export const firstLetterCap = (str) => {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const getNameFromRoomJid = (roomJid) => {
  let name = roomJid.split("/")[1].split("__")[0];
  return name;
};

export const getNameAfterSlash = (dmJid) => {
  let name = dmJid.split("/")[1];
  return name;
};

export const getTwoRandomReaders = (allUsers) => {
  const max = allUsers?.length;
  if (max < 2) return allUsers;

  const first = Math.floor(Math.random() * max);
  let second;

  do {
    second = Math.floor(Math.random() * max);
  } while (second === first);

  return [allUsers[first], allUsers[second]];
};

export function isFromWeb(jid) {
  const resource = jid.split("/")[1] || "";
  return resource.toLowerCase().startsWith("web");
}
