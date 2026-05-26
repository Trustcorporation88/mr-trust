import { useEffect, useState } from 'react'
import apiClient from '../api/client'

function Campaigns() {
  const [campaigns, setCampaigns] = useState([])
  const [loading, setLoading] = useState(true)
  const [totals, setTotals] = useState(null)

  useEffect(() => {
    fetchCampaigns()
  }, [])

  const fetchCampaigns = async () => {
    try {
      setLoading(true)
      const response = await apiClient.get('/campaigns/roi/all')
      setCampaigns(response.data.campaigns)
      setTotals(response.data.totals)
    } catch (err) {
      console.error('Error fetching campaigns:', err)
    } finally {
      setLoading(false)
    }
  }

  const getROIColor = (roi) => {
    if (roi >= 100) return 'text-green-600'
    if (roi >= 0) return 'text-blue-600'
    return 'text-red-600'
  }

  const getTypeIcon = (type) => {
    switch (type) {
      case 'email':
        return '📧'
      case 'sms':
        return '📱'
      case 'social':
        return '📱'
      case 'content':
        return '📝'
      case 'event':
        return '🎪'
      case 'webinar':
        return '🎥'
      case 'ads':
        return '📢'
      default:
        return '🎯'
    }
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Campanhas de Marketing</h1>
        <p className="text-gray-600">Análise de ROI e performance de campanhas</p>
      </div>

      {/* Summary Stats */}
      {totals && (
        <div className="grid grid-cols-5 gap-4 mb-8">
          <div className="card">
            <p className="text-gray-600 text-sm font-medium">Budget Total</p>
            <p className="text-3xl font-bold text-blue-600 mt-2">
              R$ {(totals.total_budget / 1000).toFixed(0)}K
            </p>
          </div>
          <div className="card">
            <p className="text-gray-600 text-sm font-medium">Revenue Total</p>
            <p className="text-3xl font-bold text-green-600 mt-2">
              R$ {(totals.total_closed_value / 1000).toFixed(0)}K
            </p>
          </div>
          <div className="card">
            <p className="text-gray-600 text-sm font-medium">Leads Gerados</p>
            <p className="text-3xl font-bold text-purple-600 mt-2">{totals.total_leads}</p>
          </div>
          <div className="card">
            <p className="text-gray-600 text-sm font-medium">Deals Fechados</p>
            <p className="text-3xl font-bold text-indigo-600 mt-2">{totals.total_closed_deals}</p>
          </div>
          <div className="card">
            <p className="text-gray-600 text-sm font-medium">ROI Total</p>
            <p className={`text-3xl font-bold mt-2 ${getROIColor(
              totals.total_closed_value && totals.total_budget
                ? Math.round(((totals.total_closed_value - totals.total_budget) / totals.total_budget) * 100)
                : 0
            )}`}>
              {totals.total_closed_value && totals.total_budget
                ? Math.round(((totals.total_closed_value - totals.total_budget) / totals.total_budget) * 100)
                : 0}%
            </p>
          </div>
        </div>
      )}

      {/* Campaigns Table */}
      {loading ? (
        <div className="card text-center py-12">
          <p className="text-gray-600">Carregando campanhas...</p>
        </div>
      ) : campaigns.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-600">Nenhuma campanha encontrada</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6">
            {campaigns.map((campaign) => (
              <div key={campaign.id} className="card">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{getTypeIcon(campaign.type)}</span>
                      <div>
                        <h3 className="text-xl font-bold text-gray-800">{campaign.name}</h3>
                        <p className="text-sm text-gray-600">{campaign.type}</p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-2xl font-bold ${getROIColor(campaign.roi_percentage)}`}>
                      {campaign.roi_percentage}% ROI
                    </p>
                    <p className={`text-sm ${campaign.roi_amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {campaign.roi_amount >= 0 ? '+' : ''}R$ {(campaign.roi_amount / 1000).toFixed(1)}K
                    </p>
                  </div>
                </div>

                {/* Budget vs Revenue */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <p className="text-sm text-gray-600 font-medium mb-2">Orçamento: R$ {(campaign.budget / 1000).toFixed(1)}K</p>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-blue-600 h-3 rounded-full"
                        style={{
                          width: campaign.revenue && campaign.budget
                            ? Math.min(100, (campaign.revenue / campaign.budget) * 100)
                            : 0 + '%'
                        }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-medium mb-2">Revenue: R$ {(campaign.revenue || 0 / 1000).toFixed(1)}K</p>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-green-600 h-3 rounded-full"
                        style={{
                          width: campaign.closed_value && campaign.budget
                            ? Math.min(100, (campaign.closed_value / campaign.budget) * 100)
                            : 0 + '%'
                        }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-6 gap-3">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-600 font-medium">Leads</p>
                    <p className="text-xl font-bold text-gray-800 mt-1">{campaign.total_leads}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-600 font-medium">Deals</p>
                    <p className="text-xl font-bold text-gray-800 mt-1">{campaign.closed_deals}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-600 font-medium">Taxa Conv.</p>
                    <p className="text-xl font-bold text-gray-800 mt-1">
                      {campaign.total_leads > 0
                        ? Math.round((campaign.closed_deals / campaign.total_leads) * 100)
                        : 0}%
                    </p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-600 font-medium">CPL</p>
                    <p className="text-xl font-bold text-gray-800 mt-1">
                      R$ {campaign.total_leads > 0 ? (campaign.budget / campaign.total_leads).toFixed(0) : 0}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-600 font-medium">CPD</p>
                    <p className="text-xl font-bold text-gray-800 mt-1">
                      R$ {campaign.closed_deals > 0 ? (campaign.budget / campaign.closed_deals).toFixed(0) : 0}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-600 font-medium">LTV</p>
                    <p className="text-xl font-bold text-gray-800 mt-1">
                      R$ {campaign.closed_deals > 0 ? (campaign.closed_value / campaign.closed_deals).toFixed(0) : 0}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="text-sm font-semibold text-blue-900 mb-2">📊 Métricas Explicadas</h4>
            <div className="grid grid-cols-3 gap-4 text-sm text-blue-800">
              <div>
                <p className="font-medium">CPL</p>
                <p className="text-xs">Custo por Lead = Orçamento / Leads</p>
              </div>
              <div>
                <p className="font-medium">CPD</p>
                <p className="text-xs">Custo por Deal = Orçamento / Deals Fechados</p>
              </div>
              <div>
                <p className="font-medium">LTV</p>
                <p className="text-xs">Valor Médio por Deal = Revenue / Deals Fechados</p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default Campaigns
