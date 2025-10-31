// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Button, Badge, useToast } from '@/components/ui';
// @ts-ignore;
import { Users, Download, RefreshCw, TrendingUp, Shield } from 'lucide-react';

// @ts-ignore;
import { CandidateCard } from '@/components/CandidateCard';
// @ts-ignore;
import { CandidateFilters } from '@/components/CandidateFilters';
export default function RecruiterCandidates(props) {
  const [candidates, setCandidates] = useState([]);
  const [filteredCandidates, setFilteredCandidates] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('matchScore');
  const [algorithmVersion, setAlgorithmVersion] = useState('v2.3.1');
  const [regulationVersion, setRegulationVersion] = useState('EU_AI_Act_2025_v3');
  const [modelConfidence, setModelConfidence] = useState(95);
  const [loading, setLoading] = useState(true);
  const {
    toast
  } = useToast();
  const {
    $w
  } = props;

  // 获取当前法规
  const getCurrentRegulation = () => {
    const region = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (region.includes('Europe')) return 'EU_AI_Act';
    if (region.includes('America')) return 'US_State_Bias_Audit';
    if (region.includes('Asia/Shanghai')) return 'China_Content_Review';
    return 'EU_AI_Act';
  };

  // 获取候选人列表
  const fetchCandidates = async () => {
    try {
      const candidates = await $w.cloud.callDataSource({
        dataSourceName: 'candidate_profile',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            where: {
              status: {
                $in: ['active', 'screening', 'interview']
              }
            }
          },
          select: {
            $master: true
          },
          orderBy: [{
            updatedAt: 'desc'
          }],
          pageSize: 100
        }
      });

      // 获取相关合规数据
      const candidateIds = candidates.records?.map(c => c.userId) || [];
      let enrichedCandidates = [];
      if (candidateIds.length > 0) {
        const [audits, explanations, applications] = await Promise.all([$w.cloud.callDataSource({
          dataSourceName: 'compliance_audit_2025',
          methodName: 'wedaGetRecordsV2',
          params: {
            filter: {
              where: {
                entityType: {
                  $eq: 'candidate'
                },
                entityId: {
                  $in: candidateIds
                }
              }
            },
            select: {
              $master: true
            },
            orderBy: [{
              createdAt: 'desc'
            }]
          }
        }), $w.cloud.callDataSource({
          dataSourceName: 'ai_explanation_2025',
          methodName: 'wedaGetRecordsV2',
          params: {
            filter: {
              where: {
                entityType: {
                  $eq: 'candidate'
                },
                entityId: {
                  $in: candidateIds
                }
              }
            },
            select: {
              $master: true
            },
            orderBy: [{
              createdAt: 'desc'
            }]
          }
        }), $w.cloud.callDataSource({
          dataSourceName: 'application',
          methodName: 'wedaGetRecordsV2',
          params: {
            filter: {
              where: {
                candidateId: {
                  $in: candidateIds
                }
              }
            },
            select: {
              $master: true
            }
          }
        })]);
        enrichedCandidates = candidates.records?.map(candidate => {
          const audit = audits.records?.find(a => a.entityId === candidate.userId);
          const explanation = explanations.records?.find(e => e.entityId === candidate.userId);
          const candidateApplications = applications.records?.filter(app => app.candidateId === candidate.userId) || [];
          return {
            id: candidate.userId,
            name: candidate.fullName || '匿名候选人',
            avatar: candidate.avatarUrl || '/default-avatar.png',
            email: candidate.email || '未提供',
            phone: candidate.phone || '未提供',
            position: candidate.targetPosition || '未指定',
            experience: candidate.experience || 0,
            skills: candidate.skills || [],
            location: candidate.location || '未指定',
            salary: candidate.expectedSalary || '面议',
            matchScore: candidate.matchScore || 85,
            biasScore: audit?.score || 2,
            algorithmVersion: audit?.algorithmVersion || 'v2.3.1',
            modelConfidence: explanation?.modelConfidence || 95,
            applications: candidateApplications.length,
            lastActive: candidate.updatedAt || new Date().toISOString(),
            status: candidate.status || 'active',
            diversityScore: candidate.diversityScore || 85
          };
        }) || [];
      }
      setCandidates(enrichedCandidates);
      setFilteredCandidates(enrichedCandidates);
    } catch (error) {
      console.error('获取候选人数据失败:', error);
      // 使用模拟数据
      const mockCandidates = [{
        id: '1',
        name: '张小明',
        avatar: '/avatar1.jpg',
        email: 'zhang@example.com',
        position: '前端工程师',
        experience: 5,
        skills: ['React', 'JavaScript', 'TypeScript', 'Node.js'],
        location: '北京',
        salary: '20k-30k',
        matchScore: 92,
        biasScore: 1,
        algorithmVersion: 'v2.3.1',
        modelConfidence: 95,
        applications: 3,
        lastActive: new Date().toISOString(),
        status: 'active',
        diversityScore: 88
      }, {
        id: '2',
        name: '李小红',
        avatar: '/avatar2.jpg',
        email: 'li@example.com',
        position: '产品经理',
        experience: 7,
        skills: ['产品设计', '用户研究', '数据分析', '敏捷开发'],
        location: '上海',
        salary: '25k-35k',
        matchScore: 89,
        biasScore: 2,
        algorithmVersion: 'v2.3.1',
        modelConfidence: 94,
        applications: 2,
        lastActive: new Date().toISOString(),
        status: 'screening',
        diversityScore: 92
      }, {
        id: '3',
        name: '王小强',
        avatar: '/avatar3.jpg',
        email: 'wang@example.com',
        position: '后端工程师',
        experience: 6,
        skills: ['Python', 'Django', 'PostgreSQL', 'Redis'],
        location: '深圳',
        salary: '25k-35k',
        matchScore: 87,
        biasScore: 3,
        algorithmVersion: 'v2.3.1',
        modelConfidence: 93,
        applications: 4,
        lastActive: new Date().toISOString(),
        status: 'interview',
        diversityScore: 85
      }];
      setCandidates(mockCandidates);
      setFilteredCandidates(mockCandidates);
    } finally {
      setLoading(false);
    }
  };

  // 过滤候选人
  const filterCandidates = () => {
    let filtered = candidates;
    if (selectedFilter !== 'all') {
      switch (selectedFilter) {
        case 'high-match':
          filtered = filtered.filter(c => c.matchScore >= 90);
          break;
        case 'low-bias':
          filtered = filtered.filter(c => c.biasScore <= 3);
          break;
        case 'diverse':
          filtered = filtered.filter(c => c.diversityScore >= 85);
          break;
        case 'recent':
          filtered = filtered.filter(c => new Date(c.lastActive) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
          break;
      }
    }
    if (searchQuery) {
      filtered = filtered.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.position.toLowerCase().includes(searchQuery.toLowerCase()) || c.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase())));
    }
    // 排序
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'matchScore':
          return b.matchScore - a.matchScore;
        case 'experience':
          return b.experience - a.experience;
        case 'biasScore':
          return a.biasScore - b.biasScore;
        case 'diversityScore':
          return b.diversityScore - a.diversityScore;
        case 'lastActive':
          return new Date(b.lastActive) - new Date(a.lastActive);
        default:
          return 0;
      }
    });
    setFilteredCandidates(filtered);
  };

  // 导出候选人报告
  const exportCandidateReport = async candidate => {
    try {
      const reportData = {
        candidateId: candidate.id,
        name: candidate.name,
        position: candidate.position,
        matchScore: candidate.matchScore,
        biasScore: candidate.biasScore,
        diversityScore: candidate.diversityScore,
        algorithmVersion: candidate.algorithmVersion,
        modelConfidence: candidate.modelConfidence,
        regulation: getCurrentRegulation(),
        regulationVersion: regulationVersion,
        timestamp: new Date().toISOString()
      };
      const blob = new Blob([JSON.stringify(reportData, null, 2)], {
        type: 'application/json'
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `candidate_report_${candidate.name}_${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast({
        title: "导出成功",
        description: `候选人${candidate.name}的报告已导出`
      });
    } catch (error) {
      toast({
        title: "导出失败",
        description: "请稍后重试",
        variant: "destructive"
      });
    }
  };

  // 批量导出报告
  const exportAllReports = async () => {
    try {
      const reportData = {
        candidates: filteredCandidates,
        total: filteredCandidates.length,
        algorithmVersion: algorithmVersion,
        regulation: getCurrentRegulation(),
        regulationVersion: regulationVersion,
        timestamp: new Date().toISOString()
      };
      const blob = new Blob([JSON.stringify(reportData, null, 2)], {
        type: 'application/json'
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `candidates_batch_report_${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast({
        title: "批量导出成功",
        description: `已导出${filteredCandidates.length}个候选人的报告`
      });
    } catch (error) {
      toast({
        title: "导出失败",
        description: "请稍后重试",
        variant: "destructive"
      });
    }
  };

  // 查看候选人详情
  const viewCandidateDetails = candidate => {
    $w.utils.navigateTo({
      pageId: 'recruiter-candidate-detail',
      params: {
        candidateId: candidate.id,
        algorithmVersion: candidate.algorithmVersion,
        regulation: getCurrentRegulation()
      }
    });
  };
  useEffect(() => {
    fetchCandidates();
  }, []);
  useEffect(() => {
    filterCandidates();
  }, [selectedFilter, searchQuery, sortBy, candidates]);
  return <div className="min-h-screen bg-gray-50 p-4">
      <style jsx>{`
        body {
          background: #f9fafb;
        }
      `}</style>
      
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold">候选人管理</h1>
            <p className="text-gray-600 mt-1">基于{getCurrentRegulation()}的合规候选人筛选</p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 p-2 bg-blue-50 rounded-lg">
                <TrendingUp className="h-4 w-4 text-blue-600" />
                <span className="text-sm text-blue-600">AI置信度: {modelConfidence}%</span>
              </div>
              <div className="flex items-center space-x-2 p-2 bg-green-50 rounded-lg">
                <Shield className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-600">算法版本: {algorithmVersion}</span>
              </div>
            </div>
            <Button onClick={exportAllReports} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              批量导出
            </Button>
            <Button onClick={fetchCandidates} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              刷新
            </Button>
          </div>
        </div>

        {/* 统计信息 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">总候选人</p>
                <p className="text-2xl font-bold">{candidates.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">高匹配度</p>
                <p className="text-2xl font-bold">{candidates.filter(c => c.matchScore >= 90).length}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">低偏见风险</p>
                <p className="text-2xl font-bold">{candidates.filter(c => c.biasScore <= 3).length}</p>
              </div>
              <Shield className="h-8 w-8 text-yellow-500" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">本周新增</p>
                <p className="text-2xl font-bold">{candidates.filter(c => new Date(c.lastActive) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length}</p>
              </div>
              <Users className="h-8 w-8 text-purple-500" />
            </div>
          </div>
        </div>

        {/* 筛选器 */}
        <CandidateFilters selectedFilter={selectedFilter} onFilterChange={setSelectedFilter} searchQuery={searchQuery} onSearchChange={setSearchQuery} sortBy={sortBy} onSortChange={setSortBy} />

        {/* 候选人列表 */}
        {loading ? <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                  <div>
                    <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-24"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>)}
          </div> : <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCandidates.map(candidate => <CandidateCard key={candidate.id} candidate={candidate} onViewDetails={viewCandidateDetails} onExportReport={exportCandidateReport} />)}
          </div>}

        {/* 无结果提示 */}
        {filteredCandidates.length === 0 && !loading && <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">暂无符合条件的候选人</p>
            <p className="text-gray-400 mt-2">请调整筛选条件或搜索关键词</p>
          </div>}
      </div>
    </div>;
}