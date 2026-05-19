# Script para atualizar todos os code.html files com shared-nav
$basePath = "d:\code 2\stitch_ai_h_c_t_p_h_s"
$sharedNavPath = "d:\code 2\shared-nav.html"

# Lê o shared-nav
$sharedNavContent = Get-Content $sharedNavPath -Raw

# Extrai apenas a parte de navegação (depois de <body> e antes do último </body>)
$navStarMarker = '<!-- Top Navbar (Updated with Home link) -->'
$navEndMarker = '<div id="spacer"'

$navStartIndex = $sharedNavContent.IndexOf($navStarMarker)
$navEndIndex = $sharedNavContent.IndexOf($navEndMarker)

if ($navStartIndex -ge 0 -and $navEndIndex -gt $navStartIndex) {
    $sharedNav = $sharedNavContent.Substring($navStartIndex, $navEndIndex - $navStartIndex)
    Write-Host "Extracted shared nav: $($sharedNav.Length) characters"
} else {
    Write-Host "Could not extract shared nav properly"
    Exit 1
}

# Liệt kê tất cả các thư mục code.html
$directories = @(
    "b_ng_i_u_khi_n_gi_ng_vi_n_lu_ng_ho_t_ng_1",
    "b_ng_i_u_khi_n_gi_ng_vi_n_lu_ng_ho_t_ng_2",
    "b_ng_i_u_khi_n_gi_ng_vi_n_to_n_di_n",
    "b_ng_x_p_h_ng_h_c_t_p_ngo_i_tuy_n_1",
    "b_ng_x_p_h_ng_h_c_t_p_ngo_i_tuy_n_2",
    "b_o_c_o_t_ng_k_t_h_c_k_gi_ng_vi_n_1",
    "b_o_c_o_t_ng_k_t_h_c_k_gi_ng_vi_n_2",
    "dashboard_sinh_vi_n_k_t_n_i_c_i_t_nh_c_nh_1",
    "dashboard_sinh_vi_n_k_t_n_i_c_i_t_nh_c_nh_2",
    "ng_nh_p_gi_ng_vi_n_lu_ng_b_o_m_t_2fa",
    "qu_n_l_h_c_t_p_ngo_i_tuy_n_atheneum_1",
    "qu_n_l_h_c_t_p_ngo_i_tuy_n_atheneum_2",
    "qu_n_l_l_p_h_c_chi_ti_t_t_ng_t_c",
    "t_y_ch_nh_ti_u_ch_b_o_c_o_ai_gi_ng_vi_n_1",
    "t_y_ch_nh_ti_u_ch_b_o_c_o_ai_gi_ng_vi_n_2",
    "x_c_th_c_2_l_p_k_t_n_i_dashboard_gi_ng_vi_n"
)

$updatedCount = 0

foreach ($dir in $directories) {
    $filePath = Join-Path $basePath $dir "code.html"
    
    if (Test-Path $filePath) {
        Write-Host "Processing: $dir"
        $updatedCount++
    } else {
        Write-Host "Not found: $dir"
    }
}

Write-Host ""
Write-Host "Total files to process: $updatedCount"
