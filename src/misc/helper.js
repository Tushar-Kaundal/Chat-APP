import { ref, orderByChild, query, get, equalTo } from 'firebase/database';

export function getNameInitials(name) {
  const splitName = name.toUpperCase().split(' ');
  if (splitName.length > 1) {
    return splitName[0][0] + splitName[1][0];
  }

  return splitName[0][0];
}
export function tramsformToArrWidthId(snapVal) {
  return snapVal
    ? Object.keys(snapVal).map(roomId => {
        return { ...snapVal[roomId], id: roomId };
      })
    : [];
}

export async function getUserUpdates(userId, keyToUpdate, value, db) {
  const updates = {};

  updates[`/profiles/${userId}/${keyToUpdate}`] = value;
  const getRooms = await get(
    query(
      ref(db, `/rooms`),
      orderByChild(`lastMessage/author/uid`),
      equalTo(userId)
    )
  );

  const getMsgs = await get(
    query(ref(db, '/messages'), orderByChild(`author/uid`), equalTo(userId))
  );

  const [mSnap, rSnap] = await Promise.all([getMsgs, getRooms]);

  mSnap.forEach(msgSnap => {
    updates[`/messages/${msgSnap.key}/author/${keyToUpdate}`] = value;
  });
  rSnap.forEach(roomSnap => {
    updates[`/rooms/${roomSnap.key}/lastMessage/author/${keyToUpdate}`] = value;
  });
  console.log(updates);
  return updates;
}
