$t = [IO.File]::ReadAllText('src\Nav.jsx')

# 1. Always render nav-btn-label (remove navOpen condition)
$t = $t.Replace(
    '{navOpen && <span className="nav-btn-label">{item.label}</span>}' + "`n        {isGroup && navOpen && (",
    '<span className="nav-btn-label">{item.label}</span>' + "`n        {isGroup && ("
)

# 2. Always render nav-toggle-label (remove navOpen condition, use CSS to hide)
$t = $t.Replace(
    '{(navOpen || mobile) && (' + "`n            <span className=""nav-toggle-label"" onClick={() => setPage(""home"")}`n              role=""button"" tabIndex={0}`n              onKeyDown={e => (e.key === ""Enter"" || e.key === "" "") && setPage(""home"")}>`n              HIVE`n            </span>`n          )}",
    '<span className="nav-toggle-label" onClick={() => setPage("home")} role="button" tabIndex={0} onKeyDown={e => (e.key === "Enter" || e.key === " ") && setPage("home")}>HIVE</span>'
)

# 3. Remove the space text node between label and icon
$t = $t.Replace(
    '{(navOpen || mobile) && " "}',
    ''
)

[IO.File]::WriteAllText('src\Nav.jsx', $t, [System.Text.Encoding]::UTF8)
Write-Host "Done"
Write-Host "navOpen label check: $($t.Contains('navOpen && <span className=""nav-btn-label""'))"
