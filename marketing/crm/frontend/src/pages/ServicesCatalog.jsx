import React, { useState, useEffect } from 'react';
import './ServicesCatalog.css';

const ServicesCatalog = () => {
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedService, setSelectedService] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Carregar serviços da API
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await fetch('/api/v1/services');
        const data = await response.json();
        setServices(data.services);
        setCategories(['all', ...data.categories]);
      } catch (err) {
        console.error('Erro carregando serviços:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  // Filtrar serviços por categoria
  const filteredServices = selectedCategory === 'all'
    ? services
    : services.filter(s => s.category === selectedCategory);

  const handleServiceClick = (service) => {
    setSelectedService(service);
    setModalOpen(true);
  };

  const getCategoryLabel = (cat) => {
    const labels = {
      vendas: '💼 Vendas',
      suporte: '🎫 Suporte',
      marketing: '📢 Marketing',
      dados: '📊 Dados',
      configuração: '⚙️ Configuração',
      integrações: '🔗 Integrações'
    };
    return labels[cat] || cat;
  };

  if (loading) {
    return (
      <div className="services-catalog">
        <div className="loading">Carregando catálogo de serviços...</div>
      </div>
    );
  }

  return (
    <div className="services-catalog">
      {/* Header */}
      <div className="catalog-header">
        <h1>📚 Catálogo de Serviços</h1>
        <p>Explore todos os serviços disponíveis e aprenda como utilizá-los</p>
      </div>

      {/* Category Filter */}
      <div className="category-filter">
        {categories.map(cat => (
          <button
            key={cat}
            className={`category-btn ${selectedCategory === cat ? 'active' : ''}`}
            onClick={() => setSelectedCategory(cat)}
          >
            {getCategoryLabel(cat)}
            <span className="count">
              {cat === 'all' 
                ? services.length 
                : services.filter(s => s.category === cat).length}
            </span>
          </button>
        ))}
      </div>

      {/* Services Grid */}
      <div className="services-grid">
        {filteredServices.map(service => (
          <div
            key={service.id}
            className="service-card"
            style={{ borderLeftColor: service.color }}
            onClick={() => handleServiceClick(service)}
          >
            <div className="service-header">
              <div className="service-icon" style={{ backgroundColor: service.color }}>
                {/* Icon placeholder */}
                <span className="icon-text">{service.icon.charAt(0).toUpperCase()}</span>
              </div>
              <div className="service-title">
                <h3>{service.name}</h3>
                <span className="service-category">{getCategoryLabel(service.category)}</span>
              </div>
            </div>
            <p className="service-description">{service.description}</p>
            <div className="service-footer">
              <button className="learn-btn">Saiba Mais →</button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de Instruções */}
      {modalOpen && selectedService && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="modal-header" style={{ backgroundColor: selectedService.color }}>
              <h2>{selectedService.name}</h2>
              <button className="close-btn" onClick={() => setModalOpen(false)}>✕</button>
            </div>

            {/* Modal Body */}
            <div className="modal-body">
              {/* O que é? */}
              <section className="instruction-section">
                <h4>❓ O que é?</h4>
                <p>{selectedService.instructions.what}</p>
              </section>

              {/* Passo a Passo */}
              {selectedService.instructions.steps && (
                <section className="instruction-section">
                  <h4>📋 Passo a Passo</h4>
                  <ol className="steps-list">
                    {selectedService.instructions.steps.map((step, idx) => (
                      <li key={idx}>
                        <span className="step-number">{idx + 1}</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                </section>
              )}

              {/* Campos Obrigatórios */}
              {selectedService.instructions.requiredFields && (
                <section className="instruction-section">
                  <h4>📝 Dados Necessários</h4>
                  <div className="fields-list">
                    {selectedService.instructions.requiredFields.map((field, idx) => (
                      <div key={idx} className="field-item">
                        <div className="field-header">
                          <strong>{field.field}</strong>
                          <span className="field-type">{field.type}</span>
                        </div>
                        <p>{field.description}</p>
                        {field.options && (
                          <div className="field-options">
                            {field.options.map(opt => (
                              <span key={opt} className="option-badge">{opt}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Resultado Esperado */}
              {selectedService.instructions.expectedOutput && (
                <section className="instruction-section">
                  <h4>✅ Resultado Esperado</h4>
                  <div className="expected-output">
                    <div className="output-item success">
                      <span className="checkmark">✓</span>
                      <strong>{selectedService.instructions.expectedOutput.success}</strong>
                    </div>
                    {selectedService.instructions.expectedOutput.example && (
                      <div className="example-box">
                        <p className="example-label">Exemplo:</p>
                        <pre>{JSON.stringify(selectedService.instructions.expectedOutput.example, null, 2)}</pre>
                      </div>
                    )}
                    {selectedService.instructions.expectedOutput.metrics && (
                      <div className="metrics-info">
                        <strong>📊 Métricas:</strong> {selectedService.instructions.expectedOutput.metrics}
                      </div>
                    )}
                  </div>
                </section>
              )}

              {/* Métricas Adicionais */}
              {selectedService.instructions.metrics && (
                <section className="instruction-section">
                  <h4>📊 Métricas Rastreadas</h4>
                  <div className="metrics-grid">
                    {selectedService.instructions.metrics.map((metric, idx) => (
                      <div key={idx} className="metric-card">
                        <h5>{metric.name}</h5>
                        <p>{metric.description}</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Relatórios */}
              {selectedService.instructions.reportTypes && (
                <section className="instruction-section">
                  <h4>📄 Tipos de Relatório</h4>
                  {selectedService.instructions.reportTypes.map((report, idx) => (
                    <div key={idx} className="report-item">
                      <strong>{report.type}</strong>
                      <p>{report.includes}</p>
                    </div>
                  ))}
                </section>
              )}

              {/* Triggers e Actions */}
              {selectedService.instructions.triggers && (
                <section className="instruction-section">
                  <h4>⚡ Gatilhos Disponíveis</h4>
                  <div className="triggers-actions">
                    <div className="trigger-box">
                      <h5>Gatilhos (Triggers):</h5>
                      <ul>
                        {selectedService.instructions.triggers.map((t, idx) => (
                          <li key={idx}>{t}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="action-box">
                      <h5>Ações (Actions):</h5>
                      <ul>
                        {selectedService.instructions.actions.map((a, idx) => (
                          <li key={idx}>{a}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </section>
              )}

              {/* Dados de Integração */}
              {selectedService.instructions.requiredData && (
                <section className="instruction-section">
                  <h4>🔐 Dados de Integração</h4>
                  <div className="required-data">
                    {selectedService.instructions.requiredData.map((data, idx) => (
                      <div key={idx} className="data-item">
                        <div className="data-header">
                          <strong>{data.field}</strong>
                          <span className="source">Origem: {data.source}</span>
                        </div>
                        <p>{data.description}</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>

            {/* Modal Footer */}
            <div className="modal-footer">
              <button className="close-modal-btn" onClick={() => setModalOpen(false)}>
                Fechar
              </button>
              <button className="action-btn" style={{ backgroundColor: selectedService.color }}>
                ▶ Começar Agora
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredServices.length === 0 && (
        <div className="empty-state">
          <p>Nenhum serviço encontrado nesta categoria.</p>
        </div>
      )}
    </div>
  );
};

export default ServicesCatalog;
