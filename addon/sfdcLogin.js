const params = (function () {
  const search = window.location.search.substring(1);

  return JSON.parse('{"' + decodeURI(search).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g, '":"') + '"}');
})();

document.onreadystatechange = function () {
  console.log(params);
  document.forms[0].action = params.a;
  document.getElementById("username").value = params.c;
  document.getElementById("password").value = params.b;

  document.forms[0].submit();
};
