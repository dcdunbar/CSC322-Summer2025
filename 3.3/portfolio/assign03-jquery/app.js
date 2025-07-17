// up / down / done buttons
const upHtml   = '<button class="upBtn">&uarr;</button>';
const downHtml = '<button class="downBtn">&darr;</button>';
const doneHtml = '<button class="doneBtn">&#x2713;</button>';

$(function() {
  $("#addBtn").on("click", addBtn);
  $("#newItemText").on("keyup", e => {
    if (e.key === "Enter") addBtn();
  });
});

function addBtn() {
  const txt = $("#newItemText").val().trim();
  if (!txt) return;
  addItem(txt);
  $("#newItemText").val("").focus();
}

function addItem(item) {
  const $li = $(`<li><span>${item}</span></li>`);
  const $up   = $(upHtml).on("click", () => moveItem($li, -1));
  const $down = $(downHtml).on("click", () => moveItem($li, +1));
  const $done = $(doneHtml).on("click", () => $li.remove());
  $li.append($up, $down, $done);
  $("ol").append($li);
}

function moveItem($li, delta) {
  const $all = $("ol li");
  const idx  = $li.index();
  const to   = idx + delta;
  if (to < 0 || to >= $all.length) return;
  if (delta < 0) $li.insertBefore($all.eq(to));
  else           $li.insertAfter( $all.eq(to));
}
