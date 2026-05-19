#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script para atualizar todos os code.html files com a shared-nav estrutura.
Este script extrai o conteúdo principal de cada arquivo e o envolve com a navigation compartilhada.
"""

import os
import re
from pathlib import Path

# Caminhos base
base_path = r"d:\code 2\stitch_ai_h_c_t_p_h_s"
shared_nav_path = r"d:\code 2\shared-nav.html"

# Lista de diretórios com code.html
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

def write_file(filepath, content):
    """Escreve arquivo com encoding utf-8"""
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

def extract_main_content(html_content):
    """
    Extrai o conteúdo principal (tudo que não é nav/sidebar)
    Procura por <main> ou o último bloco de conteúdo
    """
    # Procura por tag <main>
    main_match = re.search(r'<main[^>]*>(.*?)</main>', html_content, re.DOTALL)
    if main_match:
        return main_match.group(1)
    
    # Procura pela section de conteúdo (após header/nav)
    content_match = re.search(r'<!-- Main Content.*?-->(.*)', html_content, re.DOTALL)
    if content_match:
        return content_match.group(1)
    
    # Se não encontrar, retorna todo conteúdo após o último header/nav que encontrar
    # Procura pelo final da navegação
    nav_end = html_content.rfind('</header>')
    if nav_end == -1:
        nav_end = html_content.rfind('</nav>')
    if nav_end == -1:
        nav_end = html_content.rfind('</aside>')
    
    if nav_end > 0:
        return html_content[nav_end + 9:]
    
    return html_content

def extract_head_content(html_content):
    """Extrai apenas o conteúdo do <head>"""
    head_match = re.search(r'<head[^>]*>(.*?)</head>', html_content, re.DOTALL)
    if head_match:
        return head_match.group(1)
    return ""

def create_updated_file(code_html, shared_nav_structure):
    """
    Cria arquivo atualizado combinando a estrutura com o conteúdo principal
    """
    # Extrai o conteúdo principal do arquivo original
    main_content = extract_main_content(code_html)
    head_content = extract_head_content(code_html)
    
    # Cria novo arquivo
    updated_html = f"""<!DOCTYPE html>
<html lang="vi">
<head>
{head_content}
</head>
<body class="bg-surface font-body text-on-surface">
{shared_nav_structure}
{main_content}
</body>
</html>
"""
    return updated_html

def main():
    # Lê shared-nav
    print("Lendo shared-nav.html...")
    shared_nav_content = read_file(shared_nav_path)
    
    # Extrai apenas a parte de navegação
    nav_start = shared_nav_content.find('<!-- Top Navbar')
    nav_end = shared_nav_content.find('</body>')
    
    if nav_start > 0 and nav_end > nav_start:
        shared_nav_structure = shared_nav_content[nav_start:nav_end].strip()
        print(f"✓ Estrutura de nav extraída: {len(shared_nav_structure)} tokens")
    else:
        print("✗ Não conseguiu extrair shared-nav")
        return
    
    # Processa cada arquivo
    updated_count = 0
    for dir_name in directories:
        file_path = os.path.join(base_path, dir_name, "code.html")
        
        if not os.path.exists(file_path):
            print(f"✗ {dir_name}: Arquivo não encontrado")
            continue
        
        try:
            print(f"Processando {dir_name}...")
            
            # Lê arquivo original
            original_content = read_file(file_path)
            
            # Cria arquivo atualizado
            updated_content = create_updated_file(original_content, shared_nav_structure)
            
            # Salva arquivo atualizado (com backup)
            backup_path = file_path + ".backup"
            if not os.path.exists(backup_path):
                write_file(backup_path, original_content)
            
            write_file(file_path, updated_content)
            updated_count += 1
            print(f"✓ {dir_name}: Atualizado com sucesso")
            
        except Exception as e:
            print(f"✗ {dir_name}: Erro - {str(e)}")
    
    print(f"\n{'='*50}")
    print(f"Resumo: {updated_count}/{len(directories)} arquivos atualizados")
    print(f"{'='*50}")

if __name__ == "__main__":
    main()
