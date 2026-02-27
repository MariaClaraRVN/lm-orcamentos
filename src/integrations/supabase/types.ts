export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      conclusoes: {
        Row: {
          created_at: string
          data_conclusao: string
          data_entrega: string
          garantia_meses: number
          id: string
          observacoes_finais: string
          os_id: string
          pecas_substituidas: string
          servicos_executados: string
          valor_final: number
        }
        Insert: {
          created_at?: string
          data_conclusao?: string
          data_entrega?: string
          garantia_meses?: number
          id?: string
          observacoes_finais?: string
          os_id: string
          pecas_substituidas?: string
          servicos_executados?: string
          valor_final?: number
        }
        Update: {
          created_at?: string
          data_conclusao?: string
          data_entrega?: string
          garantia_meses?: number
          id?: string
          observacoes_finais?: string
          os_id?: string
          pecas_substituidas?: string
          servicos_executados?: string
          valor_final?: number
        }
        Relationships: [
          {
            foreignKeyName: "conclusoes_os_id_fkey"
            columns: ["os_id"]
            isOneToOne: false
            referencedRelation: "ordens_servico"
            referencedColumns: ["id"]
          },
        ]
      }
      diagnosticos: {
        Row: {
          causa_provavel: string
          created_at: string
          data_teste: string
          id: string
          observacoes: string
          os_id: string
          pecas_danificadas: string
          problema_identificado: string
          resultado_final: string
          tecnico_responsavel: string
          testes_realizados: string
        }
        Insert: {
          causa_provavel?: string
          created_at?: string
          data_teste?: string
          id?: string
          observacoes?: string
          os_id: string
          pecas_danificadas?: string
          problema_identificado?: string
          resultado_final?: string
          tecnico_responsavel?: string
          testes_realizados?: string
        }
        Update: {
          causa_provavel?: string
          created_at?: string
          data_teste?: string
          id?: string
          observacoes?: string
          os_id?: string
          pecas_danificadas?: string
          problema_identificado?: string
          resultado_final?: string
          tecnico_responsavel?: string
          testes_realizados?: string
        }
        Relationships: [
          {
            foreignKeyName: "diagnosticos_os_id_fkey"
            columns: ["os_id"]
            isOneToOne: false
            referencedRelation: "ordens_servico"
            referencedColumns: ["id"]
          },
        ]
      }
      itens_orcamento: {
        Row: {
          descricao: string
          id: string
          orcamento_id: string
          quantidade: number
          valor_total: number
          valor_unitario: number
        }
        Insert: {
          descricao?: string
          id?: string
          orcamento_id: string
          quantidade?: number
          valor_total?: number
          valor_unitario?: number
        }
        Update: {
          descricao?: string
          id?: string
          orcamento_id?: string
          quantidade?: number
          valor_total?: number
          valor_unitario?: number
        }
        Relationships: [
          {
            foreignKeyName: "itens_orcamento_orcamento_id_fkey"
            columns: ["orcamento_id"]
            isOneToOne: false
            referencedRelation: "orcamentos"
            referencedColumns: ["id"]
          },
        ]
      }
      midias_os: {
        Row: {
          created_at: string
          descricao: string
          etapa: string
          id: string
          os_id: string
          tipo: string
          url: string
        }
        Insert: {
          created_at?: string
          descricao?: string
          etapa?: string
          id?: string
          os_id: string
          tipo?: string
          url?: string
        }
        Update: {
          created_at?: string
          descricao?: string
          etapa?: string
          id?: string
          os_id?: string
          tipo?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "midias_os_os_id_fkey"
            columns: ["os_id"]
            isOneToOne: false
            referencedRelation: "ordens_servico"
            referencedColumns: ["id"]
          },
        ]
      }
      orcamentos: {
        Row: {
          cliente_cnpj: string
          cliente_cpf: string
          cliente_email: string
          cliente_endereco: string
          cliente_nome: string
          cliente_nome_pessoa: string
          cliente_telefone: string
          created_at: string
          data: string
          id: string
          marca_maquina: string
          modelo_maquina: string
          numero: string
          observacoes: string
          tipo_pessoa: string
          total: number
        }
        Insert: {
          cliente_cnpj?: string
          cliente_cpf?: string
          cliente_email?: string
          cliente_endereco?: string
          cliente_nome?: string
          cliente_nome_pessoa?: string
          cliente_telefone?: string
          created_at?: string
          data: string
          id?: string
          marca_maquina?: string
          modelo_maquina?: string
          numero: string
          observacoes?: string
          tipo_pessoa?: string
          total?: number
        }
        Update: {
          cliente_cnpj?: string
          cliente_cpf?: string
          cliente_email?: string
          cliente_endereco?: string
          cliente_nome?: string
          cliente_nome_pessoa?: string
          cliente_telefone?: string
          created_at?: string
          data?: string
          id?: string
          marca_maquina?: string
          modelo_maquina?: string
          numero?: string
          observacoes?: string
          tipo_pessoa?: string
          total?: number
        }
        Relationships: []
      }
      ordens_servico: {
        Row: {
          acessorios_entregues: string
          clausula_permanencia: string
          cliente_cnpj: string
          cliente_cpf: string
          cliente_email: string
          cliente_endereco: string
          cliente_nome: string
          cliente_nome_pessoa: string
          cliente_telefone: string
          created_at: string
          data_limite_abandono: string | null
          data_retirada: string
          defeito_relatado: string
          estado_geral: string
          hora_retirada: string
          horimetro: string
          id: string
          local_coleta: string
          marca: string
          modelo: string
          numero: string
          numero_serie: string
          orcamento_id: string | null
          placa_veiculo: string
          potencia: string
          responsavel_retirada: string
          status: string
          tensao: string
          tipo_maquina: string
          tipo_pessoa: string
          updated_at: string
        }
        Insert: {
          acessorios_entregues?: string
          clausula_permanencia?: string
          cliente_cnpj?: string
          cliente_cpf?: string
          cliente_email?: string
          cliente_endereco?: string
          cliente_nome?: string
          cliente_nome_pessoa?: string
          cliente_telefone?: string
          created_at?: string
          data_limite_abandono?: string | null
          data_retirada?: string
          defeito_relatado?: string
          estado_geral?: string
          hora_retirada?: string
          horimetro?: string
          id?: string
          local_coleta?: string
          marca?: string
          modelo?: string
          numero?: string
          numero_serie?: string
          orcamento_id?: string | null
          placa_veiculo?: string
          potencia?: string
          responsavel_retirada?: string
          status?: string
          tensao?: string
          tipo_maquina?: string
          tipo_pessoa?: string
          updated_at?: string
        }
        Update: {
          acessorios_entregues?: string
          clausula_permanencia?: string
          cliente_cnpj?: string
          cliente_cpf?: string
          cliente_email?: string
          cliente_endereco?: string
          cliente_nome?: string
          cliente_nome_pessoa?: string
          cliente_telefone?: string
          created_at?: string
          data_limite_abandono?: string | null
          data_retirada?: string
          defeito_relatado?: string
          estado_geral?: string
          hora_retirada?: string
          horimetro?: string
          id?: string
          local_coleta?: string
          marca?: string
          modelo?: string
          numero?: string
          numero_serie?: string
          orcamento_id?: string | null
          placa_veiculo?: string
          potencia?: string
          responsavel_retirada?: string
          status?: string
          tensao?: string
          tipo_maquina?: string
          tipo_pessoa?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ordens_servico_orcamento_id_fkey"
            columns: ["orcamento_id"]
            isOneToOne: false
            referencedRelation: "orcamentos"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
