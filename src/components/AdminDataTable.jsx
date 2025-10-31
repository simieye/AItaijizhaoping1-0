// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Card, CardContent, CardHeader, CardTitle, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Badge, Button, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui';
// @ts-ignore;
import { Eye, Edit, Trash2, Search, Filter, Download, ChevronUp, ChevronDown } from 'lucide-react';

export function AdminDataTable({
  type = 'overview',
  data = {},
  loading = false,
  pagination = {
    page: 1,
    pageSize: 10,
    total: 0
  },
  filters = {},
  sortConfig = {},
  onPageChange,
  onFilterChange,
  onSortChange,
  onRowClick,
  onEdit,
  onDelete
}) {
  const [tableData, setTableData] = useState([]);
  const [loadingData, setLoadingData] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [bulkActions, setBulkActions] = useState([]);

  // 获取表格数据
  const fetchTableData = async () => {
    try {
      setLoadingData(true);

      // 构建查询条件
      const whereConditions = [];
      if (filters.search) {
        whereConditions.push({
          $or: [{
            name: {
              $search: filters.search
            }
          }, {
            email: {
              $search: filters.search
            }
          }, {
            role: {
              $search: filters.search
            }
          }]
        });
      }
      if (filters.role && filters.role !== 'all') {
        whereConditions.push({
          role: {
            $eq: filters.role
          }
        });
      }
      if (filters.status && filters.status !== 'all') {
        whereConditions.push({
          status: {
            $eq: filters.status
          }
        });
      }
      if (filters.dateRange && filters.dateRange !== 'all') {
        const now = new Date();
        let startDate;
        switch (filters.dateRange) {
          case 'today':
            startDate = new Date(now.setHours(0, 0, 0, 0));
            break;
          case 'week':
            startDate = new Date(now.setDate(now.getDate() - 7));
            break;
          case 'month':
            startDate = new Date(now.setMonth(now.getMonth() - 1));
            break;
          case 'quarter':
            startDate = new Date(now.setMonth(now.getMonth() - 3));
            break;
          default:
            startDate = null;
        }
        if (startDate) {
          whereConditions.push({
            createdAt: {
              $gte: startDate
            }
          });
        }
      }
      const filter = whereConditions.length > 0 ? {
        $and: whereConditions
      } : {};

      // 构建排序
      const orderBy = sortConfig.field ? [{
        [sortConfig.field]: sortConfig.direction
      }] : [{
        createdAt: 'desc'
      }];
      const response = await $w.cloud.callDataSource({
        dataSourceName: 'user',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            where: filter
          },
          orderBy,
          pageSize: pagination.pageSize,
          pageNumber: pagination.page,
          getCount: true,
          select: {
            $master: true
          }
        }
      });
      setTableData(response.records || []);
      if (onPageChange) {
        onPageChange(pagination.page, {
          total: response.total || 0,
          records: response.records || []
        });
      }
    } catch (error) {
      console.error('获取表格数据失败:', error);
      setTableData([]);
    } finally {
      setLoadingData(false);
    }
  };

  // 批量操作
  const handleBulkAction = async action => {
    if (selectedRows.length === 0) {
      return;
    }
    try {
      const results = await Promise.all(selectedRows.map(async rowId => {
        switch (action) {
          case 'delete':
            return $w.cloud.callDataSource({
              dataSourceName: 'user',
              methodName: 'wedaDeleteV2',
              params: {
                filter: {
                  where: {
                    _id: {
                      $eq: rowId
                    }
                  }
                }
              }
            });
          case 'activate':
            return $w.cloud.callDataSource({
              dataSourceName: 'user',
              methodName: 'wedaUpdateV2',
              params: {
                data: {
                  status: 'active'
                },
                filter: {
                  where: {
                    _id: {
                      $eq: rowId
                    }
                  }
                }
              }
            });
          case 'deactivate':
            return $w.cloud.callDataSource({
              dataSourceName: 'user',
              methodName: 'wedaUpdateV2',
              params: {
                data: {
                  status: 'inactive'
                },
                filter: {
                  where: {
                    _id: {
                      $eq: rowId
                    }
                  }
                }
              }
            });
          default:
            return null;
        }
      }));

      // 刷新数据
      await fetchTableData();
      setSelectedRows([]);
      setSelectAll(false);
    } catch (error) {
      console.error('批量操作失败:', error);
    }
  };

  // 处理行选择
  const handleRowSelect = rowId => {
    setSelectedRows(prev => prev.includes(rowId) ? prev.filter(id => id !== rowId) : [...prev, rowId]);
  };

  // 处理全选
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedRows([]);
    } else {
      setSelectedRows(tableData.map(row => row._id));
    }
    setSelectAll(!selectAll);
  };

  // 处理排序
  const handleSort = field => {
    const newDirection = sortConfig.field === field && sortConfig.direction === 'asc' ? 'desc' : 'asc';
    onSortChange({
      field,
      direction: newDirection
    });
  };

  // 获取状态样式
  const getStatusBadge = status => {
    const variants = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      pending: 'bg-yellow-100 text-yellow-800',
      suspended: 'bg-red-100 text-red-800'
    };
    return variants[status] || 'bg-gray-100 text-gray-800';
  };

  // 获取角色样式
  const getRoleBadge = role => {
    const variants = {
      candidate: 'bg-blue-100 text-blue-800',
      recruiter: 'bg-purple-100 text-purple-800',
      admin: 'bg-orange-100 text-orange-800'
    };
    return variants[role] || 'bg-gray-100 text-gray-800';
  };

  // 格式化日期
  const formatDate = dateString => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('zh-CN');
  };

  // 计算总页数
  const totalPages = Math.ceil(pagination.total / pagination.pageSize);
  useEffect(() => {
    fetchTableData();
  }, [pagination.page, pagination.pageSize, filters, sortConfig]);
  if (loading || loadingData) {
    return <Card>
        <CardHeader>
          <CardTitle>数据管理</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="h-10 bg-gray-200 rounded mb-4"></div>
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-12 bg-gray-200 rounded"></div>)}
            </div>
          </div>
        </CardContent>
      </Card>;
  }
  return <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>数据管理</CardTitle>
          <div className="flex items-center space-x-2">
            {/* 搜索框 */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input placeholder="搜索用户..." value={filters.search || ''} onChange={e => onFilterChange({
              ...filters,
              search: e.target.value
            })} className="pl-10 w-64" />
            </div>

            {/* 角色筛选 */}
            <Select value={filters.role || 'all'} onValueChange={value => onFilterChange({
            ...filters,
            role: value
          })}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部角色</SelectItem>
                <SelectItem value="candidate">候选人</SelectItem>
                <SelectItem value="recruiter">招聘者</SelectItem>
                <SelectItem value="admin">管理员</SelectItem>
              </SelectContent>
            </Select>

            {/* 状态筛选 */}
            <Select value={filters.status || 'all'} onValueChange={value => onFilterChange({
            ...filters,
            status: value
          })}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部状态</SelectItem>
                <SelectItem value="active">活跃</SelectItem>
                <SelectItem value="inactive">非活跃</SelectItem>
                <SelectItem value="pending">待审核</SelectItem>
                <SelectItem value="suspended">已暂停</SelectItem>
              </SelectContent>
            </Select>

            {/* 日期范围筛选 */}
            <Select value={filters.dateRange || 'all'} onValueChange={value => onFilterChange({
            ...filters,
            dateRange: value
          })}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部时间</SelectItem>
                <SelectItem value="today">今日</SelectItem>
                <SelectItem value="week">本周</SelectItem>
                <SelectItem value="month">本月</SelectItem>
                <SelectItem value="quarter">本季度</SelectItem>
              </SelectContent>
            </Select>

            {/* 批量操作 */}
            {selectedRows.length > 0 && <Select onValueChange={handleBulkAction}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="批量操作" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="activate">批量激活</SelectItem>
                  <SelectItem value="deactivate">批量停用</SelectItem>
                  <SelectItem value="delete">批量删除</SelectItem>
                </SelectContent>
              </Select>}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <input type="checkbox" checked={selectAll} onChange={handleSelectAll} className="rounded" />
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort('name')}>
                  <div className="flex items-center">
                    姓名
                    {sortConfig.field === 'name' && (sortConfig.direction === 'asc' ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />)}
                  </div>
                </TableHead>
                <TableHead>邮箱</TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort('role')}>
                  <div className="flex items-center">
                    角色
                    {sortConfig.field === 'role' && (sortConfig.direction === 'asc' ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />)}
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort('status')}>
                  <div className="flex items-center">
                    状态
                    {sortConfig.field === 'status' && (sortConfig.direction === 'asc' ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />)}
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort('createdAt')}>
                  <div className="flex items-center">
                    创建时间
                    {sortConfig.field === 'createdAt' && (sortConfig.direction === 'asc' ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />)}
                  </div>
                </TableHead>
                <TableHead>最后活跃</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tableData.map(row => <TableRow key={row._id} className="cursor-pointer hover:bg-gray-50" onClick={() => onRowClick?.(row)}>
                  <TableCell>
                    <input type="checkbox" checked={selectedRows.includes(row._id)} onChange={e => {
                  e.stopPropagation();
                  handleRowSelect(row._id);
                }} className="rounded" />
                  </TableCell>
                  <TableCell className="font-medium">{row.name || '-'}</TableCell>
                  <TableCell>{row.email || '-'}</TableCell>
                  <TableCell>
                    <Badge className={getRoleBadge(row.role)}>
                      {row.role || '未知'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusBadge(row.status)}>
                      {row.status || '未知'}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(row.createdAt)}</TableCell>
                  <TableCell>{formatDate(row.updatedAt)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <Button variant="ghost" size="sm" onClick={e => {
                    e.stopPropagation();
                    onEdit?.(row);
                  }}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={e => {
                    e.stopPropagation();
                    onDelete?.(row);
                  }}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>)}
            </TableBody>
          </Table>
        </div>

        {/* 分页 */}
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-gray-600">
            显示 {(pagination.page - 1) * pagination.pageSize + 1} 到 {Math.min(pagination.page * pagination.pageSize, pagination.total)} 条，
            共 {pagination.total} 条
          </div>
          
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious onClick={() => pagination.page > 1 && onPageChange(pagination.page - 1)} disabled={pagination.page <= 1} />
              </PaginationItem>
              
              {[...Array(Math.min(5, totalPages))].map((_, index) => {
              const pageNum = index + 1;
              return <PaginationItem key={pageNum}>
                    <PaginationLink onClick={() => onPageChange(pageNum)} isActive={pagination.page === pageNum}>
                      {pageNum}
                    </PaginationLink>
                  </PaginationItem>;
            })}
              
              {totalPages > 5 && <PaginationItem>
                  <span className="px-2">...</span>
                </PaginationItem>}
              
              <PaginationItem>
                <PaginationNext onClick={() => pagination.page < totalPages && onPageChange(pagination.page + 1)} disabled={pagination.page >= totalPages} />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </CardContent>
    </Card>;
}