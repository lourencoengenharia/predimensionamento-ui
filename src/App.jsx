import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { Calculator, Building, FileText, Users } from 'lucide-react'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import OrcamentosPage from './pages/OrcamentosPage'
import api from './services/api'
import './App.css'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [currentTab, setCurrentTab] = useState('login')
  const [projetos, setProjetos] = useState([])
  const [projetoAtual, setProjetoAtual] = useState({
    nome: '',
    comprimento: '',
    largura: '',
    altura: '',
    inclinacao_telhado: '10',
    tipo_cobertura: 'duas_aguas',
    cidade: '',
    estado: 'SP',
    tipo_aco: 'ASTM A36',
    tipo_telha: 'metalica',
    tratamento_superficial: 'galvanizacao_fogo',
    sobrecarga_cobertura: '0.25'
  })
  const [resultadoCalculo, setResultadoCalculo] = useState(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      setIsAuthenticated(true)
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      carregarProjetos()
    }
  }, [])

  const carregarProjetos = async () => {
    try {
      const response = await api.get('/projetos')
      setProjetos(response.data)
    } catch (error) {
      console.error('Erro ao carregar projetos:', error)
    }
  }

  const handleLogin = () => {
    setIsAuthenticated(true)
    carregarProjetos()
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    delete api.defaults.headers.common['Authorization']
    setIsAuthenticated(false)
    setCurrentTab('login')
  }

  const handleInputChange = (field, value) => {
    setProjetoAtual(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const calcularGalpao = async () => {
    try {
      const response = await api.post('/dimensionamento/galpao', {
        comprimento: parseFloat(projetoAtual.comprimento),
        largura: parseFloat(projetoAtual.largura),
        altura: parseFloat(projetoAtual.altura),
        inclinacao_telhado: parseFloat(projetoAtual.inclinacao_telhado),
        estado: projetoAtual.estado
      })
      setResultadoCalculo(response.data.resultado_calculo)
    } catch (error) {
      console.error('Erro no cÃ¡lculo:', error)
    }
  }

  const salvarProjeto = async () => {
    try {
      await api.post('/projetos', projetoAtual)
      carregarProjetos()
      alert('Projeto salvo com sucesso!')
    } catch (error) {
      console.error('Erro ao salvar projeto:', error)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-2xl font-bold text-gray-800">
              Sistema de PrÃ©-Dimensionamento
            </CardTitle>
            <CardDescription className="text-center">
              Estruturas MetÃ¡licas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={currentTab} onValueChange={setCurrentTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Registro</TabsTrigger>
              </TabsList>
              <TabsContent value="login">
                <LoginPage onLogin={handleLogin} />
              </TabsContent>
              <TabsContent value="register">
                <RegisterPage />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Building className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-xl font-semibold text-gray-900">
                PrÃ©-Dimensionamento Estrutural
              </h1>
            </div>
            <Button onClick={handleLogout} variant="outline">
              Sair
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="dimensionamento" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="dimensionamento" className="flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              Dimensionamento
            </TabsTrigger>
            <TabsTrigger value="projetos" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Projetos
            </TabsTrigger>
            <TabsTrigger value="orcamentos" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              OrÃ§amentos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dimensionamento">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* FormulÃ¡rio de Entrada */}
              <Card>
                <CardHeader>
                  <CardTitle>Dados do GalpÃ£o</CardTitle>
                  <CardDescription>
                    Insira as informaÃ§Ãµes bÃ¡sicas para o prÃ©-dimensionamento
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="nome">Nome do Projeto</Label>
                      <Input
                        id="nome"
                        value={projetoAtual.nome}
                        onChange={(e) => handleInputChange('nome', e.target.value)}
                        placeholder="Ex: GalpÃ£o Industrial"
                      />
                    </div>
                    <div>
                      <Label htmlFor="estado">Estado</Label>
                      <Select value={projetoAtual.estado} onValueChange={(value) => handleInputChange('estado', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="SP">SÃ£o Paulo</SelectItem>
                          <SelectItem value="RJ">Rio de Janeiro</SelectItem>
                          <SelectItem value="MG">Minas Gerais</SelectItem>
                          <SelectItem value="RS">Rio Grande do Sul</SelectItem>
                          <SelectItem value="PR">ParanÃ¡</SelectItem>
                          <SelectItem value="SC">Santa Catarina</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="comprimento">Comprimento (m)</Label>
                      <Input
                        id="comprimento"
                        type="number"
                        value={projetoAtual.comprimento}
                        onChange={(e) => handleInputChange('comprimento', e.target.value)}
                        placeholder="25"
                      />
                    </div>
                    <div>
                      <Label htmlFor="largura">Largura (m)</Label>
                      <Input
                        id="largura"
                        type="number"
                        value={projetoAtual.largura}
                        onChange={(e) => handleInputChange('largura', e.target.value)}
                        placeholder="15"
                      />
                    </div>
                    <div>
                      <Label htmlFor="altura">Altura (m)</Label>
                      <Input
                        id="altura"
                        type="number"
                        value={projetoAtual.altura}
                        onChange={(e) => handleInputChange('altura', e.target.value)}
                        placeholder="6"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="inclinacao">InclinaÃ§Ã£o do Telhado (Â°)</Label>
                      <Input
                        id="inclinacao"
                        type="number"
                        value={projetoAtual.inclinacao_telhado}
                        onChange={(e) => handleInputChange('inclinacao_telhado', e.target.value)}
                        placeholder="10"
                      />
                    </div>
                    <div>
                      <Label htmlFor="tipo_cobertura">Tipo de Cobertura</Label>
                      <Select value={projetoAtual.tipo_cobertura} onValueChange={(value) => handleInputChange('tipo_cobertura', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="uma_agua">Uma Ãgua</SelectItem>
                          <SelectItem value="duas_aguas">Duas Ãguas</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Button onClick={calcularGalpao} className="flex-1">
                      Calcular
                    </Button>
                    <Button onClick={salvarProjeto} variant="outline" className="flex-1">
                      Salvar Projeto
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Resultados */}
              <Card>
                <CardHeader>
                  <CardTitle>Resultados do CÃ¡lculo</CardTitle>
                  <CardDescription>
                    PrÃ©-dimensionamento conforme normas brasileiras
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {resultadoCalculo ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <p className="text-sm text-blue-600 font-medium">Velocidade do Vento</p>
                          <p className="text-lg font-bold text-blue-800">
                            {resultadoCalculo.velocidade_vento?.toFixed(1)} m/s
                          </p>
                        </div>
                        <div className="bg-green-50 p-3 rounded-lg">
                          <p className="text-sm text-green-600 font-medium">Peso do AÃ§o</p>
                          <p className="text-lg font-bold text-green-800">
                            {resultadoCalculo.peso_aco_estimado?.toFixed(0)} kg
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-purple-50 p-3 rounded-lg">
                          <p className="text-sm text-purple-600 font-medium">Ãrea de Telha</p>
                          <p className="text-lg font-bold text-purple-800">
                            {resultadoCalculo.area_telha?.toFixed(1)} mÂ²
                          </p>
                        </div>
                        <div className="bg-orange-50 p-3 rounded-lg">
                          <p className="text-sm text-orange-600 font-medium">Ãrea ConstruÃ­da</p>
                          <p className="text-lg font-bold text-orange-800">
                            {resultadoCalculo.area_construida?.toFixed(1)} mÂ²
                          </p>
                        </div>
                      </div>
                      {resultadoCalculo.cargas_vento && (
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h4 className="font-medium text-gray-800 mb-2">Cargas de Vento</h4>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <p>PressÃ£o DinÃ¢mica: {resultadoCalculo.cargas_vento.pressao_dinamica?.toFixed(2)} N/mÂ²</p>
                            <p>Parede Barlavento: {resultadoCalculo.cargas_vento.carga_parede_barlavento?.toFixed(2)} N/mÂ²</p>
                            <p>Parede Sotavento: {resultadoCalculo.cargas_vento.carga_parede_sotavento?.toFixed(2)} N/mÂ²</p>
                            <p>Cobertura: {resultadoCalculo.cargas_vento.carga_cobertura?.toFixed(2)} N/mÂ²</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center text-gray-500 py-8">
                      <Calculator className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>Preencha os dados e clique em "Calcular" para ver os resultados</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="projetos">
            <Card>
              <CardHeader>
                <CardTitle>Meus Projetos</CardTitle>
                <CardDescription>
                  Gerencie seus projetos salvos
                </CardDescription>
              </CardHeader>
              <CardContent>
                {projetos.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {projetos.map((projeto) => (
                      <Card key={projeto.id} className="cursor-pointer hover:shadow-md transition-shadow">
                        <CardHeader>
                          <CardTitle className="text-lg">{projeto.nome}</CardTitle>
                          <CardDescription>
                            {projeto.comprimento}m Ã— {projeto.largura}m Ã— {projeto.altura}m
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-gray-600">
                            Criado em: {new Date(projeto.created_at).toLocaleDateString('pt-BR')}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>Nenhum projeto salvo ainda</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orcamentos">
            <OrcamentosPage />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

export default App


