// 코스 전체 목록 조회
export const getRoutes = async () => {
  const res = await fetch("/api/routes");
  if (!res.ok) throw new Error("코스 목록 조회 실패");

  const text = await res.text();
  const safeJson = JSON.parse(text, (key, value) => {
    if (key === "route" || key === "description") return null;
    return value;
  });

  return safeJson;
};

// 코스 상세 조회
export const getRouteById = async (id) => {
  const res = await fetch(`/api/routes/${id}`);
  if (!res.ok) throw new Error("코스 상세 조회 실패");
  return res.json();
};

// 댓글 목록 조회
export const getRouteComments = async (routeId) => {
  const res = await fetch(`/api/routes/${routeId}/comments`);
  if (!res.ok) throw new Error("댓글 목록 조회 실패");
  return res.json();
};

// 댓글 등록
export const addRouteComment = async (routeId, content) => {
  const res = await fetch(`/api/routes/${routeId}/comments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content }),
  });

  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

// 댓글 삭제
export const deleteRouteComment = async (commentId) => {
  const res = await fetch(`/api/routes/comments/${commentId}`, {
    method: "DELETE",
  });

  if (!res.ok) throw new Error(await res.text());
};

// 추천 여부 조회
export const checkLiked = async (routeId) => {
  const res = await fetch(`/api/like/check?routeId=${routeId}`);
  if (!res.ok) throw new Error("추천 상태 조회 실패");
  return res.json();
};

// 추천 추가
export const addLike = async (routeId) => {
  const res = await fetch(`/api/like/add?routeId=${routeId}`, {
    method: "PUT",
  });

  if (!res.ok) throw new Error("추천 추가 실패");
  return res.text();
};

// 추천 취소
export const removeLike = async (routeId) => {
  const res = await fetch(`/api/like/delete?routeId=${routeId}`, {
    method: "DELETE",
  });

  if (!res.ok) throw new Error("추천 취소 실패");
  return res.text();
};

// 저장 목록 조회
export const getDipList = async (userId) => {
  const res = await fetch(`/api/dip/list?userId=${encodeURIComponent(userId)}`);
  if (!res.ok) throw new Error("저장 목록 조회 실패");
  return res.json();
};

// 저장 추가
export const addDip = async (routeId, userId) => {
  const res = await fetch(
    `/api/dip/add?userId=${encodeURIComponent(userId)}&routeId=${routeId}`,
    { method: "PUT" }
  );

  const text = await res.text();
  if (!res.ok) throw new Error(text);
  return text;
};

// 저장 삭제
export const removeDip = async (dipId) => {
  const res = await fetch(
    `/api/dip/remove/${dipId}`,
    { method: "DELETE" }
  );

  const text = await res.text();
  if (!res.ok) throw new Error(text);
  return text;
};
export const removeDipByRoute = async (routeId, userId) => {
  const res = await fetch(
    `/api/dip/removeByRoute?routeId=${routeId}`,
    { method: "DELETE" }
  );

  const text = await res.text();
  if (!res.ok) throw new Error(text);
  return text;
};
export const updateDip = async (id, complete, record) => {
  // ✅ 숫자 ID를 문자열로 변환하지 않음
  const qId = String(id);  // Long -> String 변환만
  const qComplete = complete.toString();  // boolean -> "true"/"false"
  const qRecord = record == null ? "" : encodeURIComponent(record);

  const url = `/api/dip/update?id=${qId}&complete=${qComplete}&record=${qRecord}`;
  console.log("UpdateDip URL:", url);  // ✅ 디버깅용 로그
  
  const res = await fetch(url, { method: "PUT" });
  const text = await res.text();
  if (!res.ok) throw new Error(text);
  return text;
};
