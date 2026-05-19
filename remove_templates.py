#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script para remover variáveis de template não resolvidas
"""

import os
import re
from pathlib import Path

base_path = r"d:\code 2\stitch_ai_h_c_t_p_h_s"

directories_with_templates = [
    "b_o_c_o_t_ng_k_t_h_c_k_gi_ng_vi_n_2",
    "dashboard_sinh_vi_n_k_t_n_i_c_i_t_nh_c_nh_1",
    "dashboard_sinh_vi_n_k_t_n_i_c_i_t_nh_c_nh_2",
    "ng_nh_p_gi_ng_vi_n_lu_ng_b_o_m_t_2fa",
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

def remove_template_variables(html_content):
    """Remove variáveis de template não resolvidas"""
    # Substitui {{DATA:SCREEN:...}} com #
    updated = re.sub(r'{{DATA:SCREEN:[^}]*}}', '#', html_content)
    return updated

def main():
    print("Removendo variáveis de template não resolvidas...")
    print("="*60)
    
    for dir_name in directories_with_templates:
        file_path = os.path.join(base_path, dir_name, "code.html")
        
        if not os.path.exists(file_path):
            print(f"✗ {dir_name}: Arquivo não encontrado")
            continue
        
        try:
            content = read_file(file_path)
            
            # Encontra quantas variáveis existem
            template_count = len(re.findall(r'{{DATA:SCREEN:[^}]*}}', content))
            
            # Remove as variáveis
            updated_content = remove_template_variables(content)
            
            # Salva arquivo
            write_file(file_path, updated_content)
            
            print(f"✓ {dir_name}: {template_count} template variables removidas")
            
        except Exception as e:
            print(f"✗ {dir_name}: Erro - {str(e)}")
    
    print("="*60)
    print("Processo concluído!")

if __name__ == "__main__":
    main()
