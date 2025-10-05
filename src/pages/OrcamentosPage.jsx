_# Path: predimensionamento-ui/src/pages/OrcamentosPage.jsx_

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx';
import { FileText, DollarSign, Settings, Download } from 'lucide-react';
import api from '../services/api';

const OrcamentosPage = () => {
  const [projetos, setProjetos] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [orcamentos, setOrcamentos] = useState([]);
  const [projetoSelecionado, setProjetoSelecionado] = useState('');
  const [templateSelecionado, setTemplateSelecionado] = useState('');
  const [novoTemplate, setNovoTemplate] = useState({
    nome: '',
    preco_kg_aco_default: '8.50',
    preco_m2_telha_default: '45.00',
    percentual_montagem: '0.30',
    percentual_projeto: '0.15'
  });
  const [orcamentoAtual, setOrcamentoAtual] = useState(null);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      const [projetosRes, templatesRes] = await Promise.all([
        api.get('/projetos'),
        api.get('/orcamentos/templates')
      ]);
      setProjetos(projetosRes.data);
      setTemplates(templatesRes.data);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  };

  const criarTemplate = async () => {
    try {
      await api.post('/orcamentos/templates', {
        ...novoTemplate,
        preco_kg_aco_default: parseFloat(novoTemplate.preco_kg_aco_default),
        preco_m2_telha_default: parseFloat(novoTemplate.preco_m2_telha_default),
        percentual_montagem: parseFloat(novoTemplate.percentual_montagem),
        percentual_projeto: parseFloat(novoTemplate.percentual_projeto)
      });
      carregarDados();
      setNovoTemplate({
        nome: '',
        preco_kg_aco_default: '8.50',
        preco_m2_telha_default: '45.00',
        percentual_montagem: '0.30',
        percentual_projeto: '0.15'
      });
      alert('Template criado com sucesso!');
    } catch (error) {
      console.error('Erro ao criar template:', error);
    }
  };

  const gerarOrcamento = async () => {
    if (!projetoSelecionado) {
      alert('Selecione um projeto');
      return;
    }

    try {
      const response = await api.post(`/orcamentos/gerar/${projetoSelecionado}`, {
        template_id: templateSelecionado || null
      });
      setOrcamentoAtual(response.data);
    } catch (error) {
      console.error('Erro ao gerar orÃ§amento:', error);
    }
  };

  const baixarPlanilha = async (orcamentoId) => {
    try {
      const response = await api.get(`/orcamentos/planilha/${orcamentoId}`);
      const planilha = response.data;
      
      // Criar conteÃºdo da planilha em formato texto
      let conteudo = `ORÃ‡AMENTO - ${planilha.cabecalho.projeto}\n`;
      conteudo += `Data: ${planilha.cabecalho.data}\n`;
      conteudo += `DimensÃµes: ${planilha.cabecalho.dimensoes}\n\n`;
      
      conteudo += `MATERIAIS:\n`;
      planilha.materiais.forEach(item => {
        conteudo += `${item.item}: ${item.quantidade} ${item.unidade} x R$ ${item.preco_unitario.toFixed(2)} = R$ ${item.total.toFixed(2)}\n`;
      });
      
      conteudo += `\nSERVIÃ‡OS:\n`;
      planilha.servicos.forEach(item => {
        conteudo += `${item.item}: R$ ${item.total.toFixed(2)}\n`;
      });
      
      conteudo += `\nTOTAL GERAL: R$ ${planilha.totais.total_geral.toFixed(2)}`;
      
      // Download do arquivo
      const blob = new Blob([conteudo], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `orcamento_${planilha.cabecalho.projeto.replace(/\s+/g, '_')}.txt`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erro ao baixar planilha:', error);
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="gerar" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="gerar" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Gerar OrÃ§amento
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="historico" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            HistÃ³rico
          </TabsTrigger>
        </TabsList>

        <TabsContent value="gerar">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* FormulÃ¡rio de GeraÃ§Ã£o */}
            <Card>
              <CardHeader>
                <CardTitle>Gerar Novo OrÃ§amento</CardTitle>
                <CardDescription>
                  Selecione um projeto e template para gerar o orÃ§amento
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="projeto">Projeto</Label>
                  <Select value={projetoSelecionado} onValueChange={setProjetoSelecionado}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um projeto" />
                    </SelectTrigger>
                    <SelectContent>
                      {projetos.map((projeto) => (
                        <SelectItem key={projeto.id} value={projeto.id.toString()}>
                          {projeto.nome} ({projeto.comprimento}x{projeto.largura}x{projeto.altura}m)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="template">Template de PreÃ§os (Opcional)</Label>
                  <Select value={templateSelecionado} onValueChange={setTemplateSelecionado}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um template ou deixe em branco para usar padrÃ£o" />
                    </SelectTrigger>
                    <SelectContent>
                      {templates.map((template) => (
                        <SelectItem key={template.id} value={template.id.toString()}>
                          {template.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button onClick={gerarOrcamento} className="w-full">
                  Gerar OrÃ§amento
                </Button>
              </CardContent>
            </Card>

            {/* Resultado do OrÃ§amento */}
            <Card>
              <CardHeader>
                <CardTitle>Resultado do OrÃ§amento</CardTitle>
                <CardDescription>
                  Detalhes do orÃ§amento gerado
                </CardDescription>
              </CardHeader>
              <CardContent>
                {orcamentoAtual ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <p className="text-sm text-blue-600 font-medium">Peso do AÃ§o</p>
                        <p className="text-lg font-bold text-blue-800">
                          {orcamentoAtual.orcamento.peso_total_aco?.toFixed(0)} kg
                        </p>
                      </div>
                      <div className="bg-green-50 p-3 rounded-lg">
                        <p className="text-sm text-green-600 font-medium">Ãrea de Telha</p>
                        <p className="text-lg font-bold text-green-800">
                          {orcamentoAtual.orcamento.area_telha?.toFixed(1)} mÂ²
                        </p>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-800 mb-3">Custos</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Estrutura de AÃ§o:</span>
                          <span>R$ {orcamentoAtual.orcamento.custo_aco?.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Telhas:</span>
                          <span>R$ {orcamentoAtual.orcamento.custo_telha?.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Montagem:</span>
                          <span>R$ {orcamentoAtual.orcamento.custo_montagem?.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Projeto:</span>
                          <span>R$ {orcamentoAtual.orcamento.custo_projeto?.toFixed(2)}</span>
                        </div>
                        <hr className="my-2" />
                        <div className="flex justify-between font-bold text-lg">
                          <span>Total:</span>
                          <span>R$ {orcamentoAtual.orcamento.custo_total?.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>PreÃ§o por mÂ²:</span>
                          <span>R$ {orcamentoAtual.resumo?.preco_por_m2?.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>

                    <Button 
                      onClick={() => baixarPlanilha(orcamentoAtual.orcamento.id)} 
                      className="w-full"
                      variant="outline"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Baixar Planilha
                    </Button>
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    <DollarSign className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>Selecione um projeto e clique em "Gerar OrÃ§amento"</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="templates">
          <Card>
            <CardHeader>
              <CardTitle>Templates de OrÃ§amento</CardTitle>
              <CardDescription>
                Crie e gerencie templates com preÃ§os padrÃ£o
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Criar Novo Template */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Criar Novo Template</h3>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="nome_template">Nome do Template</Label>
                      <Input
                        id="nome_template"
                        value={novoTemplate.nome}
                        onChange={(e) => setNovoTemplate(prev => ({ ...prev, nome: e.target.value }))}
                        placeholder="Ex: PreÃ§os 2024"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="preco_aco">PreÃ§o do AÃ§o (R$/kg)</Label>
                        <Input
                          id="preco_aco"
                          type="number"
                          step="0.01"
                          value={novoTemplate.preco_kg_aco_default}
                          onChange={(e) => setNovoTemplate(prev => ({ ...prev, preco_kg_aco_default: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="preco_telha">PreÃ§o da Telha (R$/mÂ²)</Label>
                        <Input
                          id="preco_telha"
                          type="number"
                          step="0.01"
                          value={novoTemplate.preco_m2_telha_default}
                          onChange={(e) => setNovoTemplate(prev => ({ ...prev, preco_m2_telha_default: e.target.value }))}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="perc_montagem">% Montagem</Label>
                        <Input
                          id="perc_montagem"
                          type="number"
                          step="0.01"
                          value={novoTemplate.percentual_montagem}
                          onChange={(e) => setNovoTemplate(prev => ({ ...prev, percentual_montagem: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="perc_projeto">% Projeto</Label>
                        <Input
                          id="perc_projeto"
                          type="number"
                          step="0.01"
                          value={novoTemplate.percentual_projeto}
                          onChange={(e) => setNovoTemplate(prev => ({ ...prev, percentual_projeto: e.target.value }))}
                        />
                      </div>
                    </div>
                    <Button onClick={criarTemplate} className="w-full">
                      Criar Template
                    </Button>
                  </div>
                </div>

                {/* Lista de Templates */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Templates Existentes</h3>
                  <div className="space-y-3">
                    {templates.map((template) => (
                      <Card key={template.id} className="p-4">
                        <h4 className="font-medium">{template.nome}</h4>
                        <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mt-2">
                          <p>AÃ§o: R$ {template.preco_kg_aco_default}/kg</p>
                          <p>Telha: R$ {template.preco_m2_telha_default}/mÂ²</p>
                          <p>Montagem: {(template.percentual_montagem * 100).toFixed(0)}%</p>
                          <p>Projeto: {(template.percentual_projeto * 100).toFixed(0)}%</p>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="historico">
          <Card>
            <CardHeader>
              <CardTitle>HistÃ³rico de OrÃ§amentos</CardTitle>
              <CardDescription>
                Visualize orÃ§amentos gerados anteriormente
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center text-gray-500 py-8">
                <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Funcionalidade de histÃ³rico em desenvolvimento</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OrcamentosPage;


