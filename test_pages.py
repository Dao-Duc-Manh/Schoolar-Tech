#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script para testar pages e verificar navegação
"""

import os
import re
from pathlib import Path

base_path = r"d:\code 2\stitch_ai_h_c_t_p_h_s"

directories = [
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
    "x_c_th_c_2_l_p_k_t_n_i_dashboard_gi_ng_vi_n",
]

def read_file(filepath):
    """Lê arquivo com tratamento de encoding"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            return f.read()
    except UnicodeDecodeError:
        with open(filepath, 'r', encoding='latin-1') as f:
            return f.read()

def test_page_integrity(html_content, page_name):
    """Testa a integridade da página"""
    issues = []
    
    # 1. Verificar tags HTML básicas
    html_tags = {
        '<html': ('</html', 'HTML'),
        '<head': ('</head', 'HEAD'),
        '<body': ('</body>', 'BODY'),
    }
    
    for open_tag, (close_tag, name) in html_tags.items():
        open_count = html_content.count(open_tag)
        close_count = html_content.count(close_tag)
        if open_count > close_count:
            issues.append(f"Mismatched {name} tags (open: {open_count}, close: {close_count})")
    
    # 2. Verificar Tailwind CSS
    if 'tailwind.config' not in html_content:
        issues.append("Missing Tailwind CSS config")
    if 'https://cdn.tailwindcss.com' not in html_content:
        issues.append("Missing Tailwind CDN")
    
    # 3. Verificar fontes
    if 'fonts.googleapis.com' not in html_content:
        issues.append("Missing Google Fonts")
    if 'Material+Symbols+Outlined' not in html_content and 'Material Symbols' not in html_content:
        issues.append("Missing Material Symbols icons")
    
    # 4. Verificar navegação
    nav_count = html_content.count('<!-- Top Navbar')
    if nav_count < 1:
        issues.append("Missing Top Navbar")
    
    # 5. Verificar sidebar
    sidebar_count = html_content.count('<aside')
    if sidebar_count < 1:
        issues.append("Missing Sidebar")
    
    # 6. Verificar conteúdo principal
    main_count = html_content.count('<main')
    if main_count < 0:
        issues.append("Missing main content area")
    
    # 7. Procurar por inconsistências de class Tailwind
    invalid_classes = re.findall(r'class="[^"]*undefined[^"]*"', html_content)
    if invalid_classes:
        issues.append(f"Found undefined CSS classes: {len(invalid_classes)}")
    
    # 8. Verificar broken references
    broken_hrefs = re.findall(r'href="[^"]*{{[^}]*}}[^"]*"', html_content)
    if broken_hrefs:
        issues.append(f"Found template variables in href: {len(broken_hrefs)}")
    
    # 9. Verificar imagens quebradas
    img_count = html_content.count('<img ')
    https_count = html_content.count('src="https://')
    if img_count > 0 and https_count == 0:
        # Verificar se todas as imagens têm src
        img_no_src = re.findall(r'<img[^>]*(?!src=)', html_content)
        if img_no_src:
            issues.append(f"Found images without src: {len(img_no_src)}")
    
    # 10. Verificar onclick handlers inline
    onclick_count = html_content.count('onclick=')
    if onclick_count > 0:
        pass  # OK, é permitido ter onclick
    
    return issues

def test_navigation_consistency(html_content, page_name):
    """Testa consistência da navegação entre páginas"""
    issues = []
    
    # Verificar se a navegação tem links válidos
    nav_links = re.findall(r'<a[^>]*href="([^"]*)"[^>]*>', html_content)
    
    # Verificar links quebrados (muito genéricos)
    broken_links = 0
    for link in nav_links:
        if link.startswith('javascript:') or link.startswith('#'):
            # OK - JavaScript ou âncora
            pass
        elif not link.startswith('http') and not link.startswith('../') and link != '#':
            if not link.startswith('.'):
                # Possível link quebrado
                if link.startswith('{{'):
                    broken_links += 1
    
    if broken_links > 0:
        issues.append(f"Found {broken_links} potential template variable links")
    
    # Verificar se tem home link
    if '../index.html' not in html_content and '/index.html' not in html_content:
        issues.append("Missing home page link")
    
    return issues

def main():
    print("="*70)
    print("TESTE DE INTEGRIDADE E NAVEGAÇÃO DAS PÁGINAS HTML")
    print("="*70)
    print()
    
    total_issues = 0
    pages_with_issues = []
    
    for dir_name in directories:
        file_path = os.path.join(base_path, dir_name, "code.html")
        
        if not os.path.exists(file_path):
            print(f"✗ {dir_name}: Arquivo não encontrado")
            continue
        
        try:
            content = read_file(file_path)
            
            # Testa integridade
            integrity_issues = test_page_integrity(content, dir_name)
            nav_issues = test_navigation_consistency(content, dir_name)
            
            all_issues = integrity_issues + nav_issues
            
            if not all_issues:
                print(f"✓ {dir_name:<45} OK")
            else:
                print(f"⚠ {dir_name:<45} {len(all_issues)} (issues)")
                pages_with_issues.append(dir_name)
                for issue in all_issues:
                    print(f"     • {issue}")
                total_issues += len(all_issues)
            
        except Exception as e:
            print(f"✗ {dir_name}: Erro - {str(e)}")
    
    print()
    print("="*70)
    print(f"Total de páginas verificadas: {len(directories)}")
    print(f"Páginas com problemas: {len(pages_with_issues)}")
    print(f"Total de issues encontrados: {total_issues}")
    print("="*70)
    
    if pages_with_issues:
        print()
        print("Páginas que necessitam revisão:")
        for page in pages_with_issues:
            print(f"  - {page}")

if __name__ == "__main__":
    main()
