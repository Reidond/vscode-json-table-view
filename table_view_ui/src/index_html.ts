import global_css from "./global_css";

export default `
<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset='utf-8'>
	<meta name='viewport' content='width=device-width,initial-scale=1'>

	<title>JSON Table View</title>

  <style>${global_css}</style>

	<link rel='stylesheet' href='/build/bundle.css'>
	<script defer src='/build/bundle.js'></script>
</head>

<body>
</body>
</html>
`;