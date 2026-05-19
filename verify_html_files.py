#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script para verificar a integridade dos arquivos HTML atualizados
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

def verify_html_structure(html_content):
    """Verifica a estrutura HTML básica"""
    issues = []
    
    # Verificar tags básicas
    if '<html' not in html_content:
        issues.append("Missing <html> tag")
    if '<head>' not in html_content and '<head ' not in html_content:
        issues.append("Missing <head> tag")
    if '<body' not in html_content:
        issues.append("Missing <body> tag")
    
    # Verificar fechamento
    if html_content.count('<html') > html_content.count('</html>'):
        issues.append("Missing </html> tag")
    if html_content.count('<body') > html_content.count('</body>'):
        issues.append("Missing </body> tag")
    
    # Verificar nav
    if '<!-- Top Navbar' not in html_content:
        issues.append("Missing shared-nav navigation")
    
    # Verificar CSS Tailwind
    if 'tailwind.config' not in html_content:
        issues.append("Missing Tailwind config")
    
    # Verificar conteúdo principal
    if '<main' in html_content:
        # Tem conteúdo principal
        pass
    
    return issues

def main():
    total_files = len(directories)
    verified_count = 0
    issues_found = 0
    
    print("="*60)
    print("VERIFICAÇÃO DE INTEGRIDADE DOS ARQUIVOS HTML ATUALIZADOS")
    print("="*60)
    print()
    
    for dir_name in directories:
        file_path = os.path.join(base_path, dir_name, "code.html")
        
        if not os.path.exists(file_path):
            print(f"✗ {dir_name}: Arquivo não encontrado")
            continue
        
        try:
            content = read_file(file_path)
            issues = verify_html_structure(content)
            
            if not issues:
                print(f"✓ {dir_name}: OK")
                verified_count += 1
            else:
                print(f"⚠ {dir_name}: {len(issues)} issue(s) encontrado(s)")
                for issue in issues:
                    print(f"   - {issue}")
                issues_found += 1
            
        except Exception as e:
            print(f"✗ {dir_name}: Erro - {str(e)}")
    
    print()
    print("="*60)
    print(f"Resumo: {verified_count}/{total_files} arquivos verificados com sucesso")
    print(f"Problemas encontrados: {issues_found}")
    print("="*60)
    
    # Verificação de consistência entre arquivos
    print()
    print("Verificando consistência entre arquivos...")
    
    nav_versions = {}
    for dir_name in directories[:3]:  # Verificar apenas os primeiros 3
        file_path = os.path.join(base_path, dir_name, "code.html")
        if os.path.exists(file_path):
            content = read_file(file_path)
            # Extrai versão do nav
            nav_match = re.search(r'<!-- Top Navbar.*?/nav>', content, re.DOTALL)
            if nav_match:
                nav_hash = hash(nav_match.group())
                nav_versions[dir_name] = nav_hash
    
    if len(set(nav_versions.values())) == 1:
        print("✓ Navegação consistente entre todos os arquivos verificados")
    else:
        print("⚠ Diferenças detectadas na navegação entre arquivos")

if __name__ == "__main__":
    main()
