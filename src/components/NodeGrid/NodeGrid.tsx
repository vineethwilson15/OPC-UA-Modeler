import { useState, useMemo } from 'react';
import { IxButton } from '@siemens/ix-react';
import { OpcUaNode, ParsedNodeset, NodeClass } from '@/types';
import './NodeGrid.css';

interface NodeGridProps {
  nodesetData: ParsedNodeset;
  onNodeSelect: (node: OpcUaNode) => void;
  selectedNodeId?: string;
}

function NodeGrid({ nodesetData, onNodeSelect, selectedNodeId }: NodeGridProps) {
  const [searchText, setSearchText] = useState('');
  const [selectedNodeTypes, setSelectedNodeTypes] = useState<Set<NodeClass>>(
    new Set(Object.values(NodeClass))
  );
  const [sortColumn, setSortColumn] = useState<keyof OpcUaNode>('displayName');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Flatten all nodes from the tree structure
  const allNodes = useMemo(() => {
    const nodes: OpcUaNode[] = [];
    const flatten = (nodeList: OpcUaNode[]) => {
      nodeList.forEach(node => {
        nodes.push(node);
        if (node.children && node.children.length > 0) {
          flatten(node.children);
        }
      });
    };
    flatten(nodesetData.rootNodes);
    return nodes;
  }, [nodesetData.rootNodes]);

  // Filter and sort nodes
  const filteredAndSortedNodes = useMemo(() => {
    const filtered = allNodes.filter(node => {
      // Type filter
      if (!selectedNodeTypes.has(node.nodeClass)) {
        return false;
      }

      // Search filter
      if (searchText) {
        const searchLower = searchText.toLowerCase();
        const matchesSearch =
          node.displayName?.toLowerCase().includes(searchLower) ||
          node.browseName?.toLowerCase().includes(searchLower) ||
          node.nodeId?.toLowerCase().includes(searchLower) ||
          node.description?.toLowerCase().includes(searchLower);

        if (!matchesSearch) {
          return false;
        }
      }

      return true;
    });

    // Sort
    filtered.sort((a, b) => {
      const aVal = a[sortColumn] ?? '';
      const bVal = b[sortColumn] ?? '';
      const comparison = String(aVal).localeCompare(String(bVal));
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [allNodes, searchText, selectedNodeTypes, sortColumn, sortDirection]);

  const handleSort = (column: keyof OpcUaNode) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const getNodeIcon = (nodeClass: NodeClass): string => {
    const iconMap: Record<NodeClass, string> = {
      [NodeClass.Object]: '📦',
      [NodeClass.Variable]: '🔢',
      [NodeClass.Method]: '⚡',
      [NodeClass.ObjectType]: '📋',
      [NodeClass.VariableType]: '📊',
      [NodeClass.ReferenceType]: '🔗',
      [NodeClass.DataType]: '💾',
      [NodeClass.View]: '👁️',
    };
    return iconMap[nodeClass] || '⚪';
  };

  return (
    <div className="node-grid">
      <h3 className="panel-title">Uploaded Nodeset: {nodesetData.fileName}</h3>

      {/* Table */}
      <div className="grid-table-container">
        <table className="grid-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('displayName')} className="sortable">
                Display Name
                {sortColumn === 'displayName' && (
                  <span className="sort-indicator">{sortDirection === 'asc' ? '▲' : '▼'}</span>
                )}
              </th>
              <th onClick={() => handleSort('nodeClass')} className="sortable">
                Node Class
                {sortColumn === 'nodeClass' && (
                  <span className="sort-indicator">{sortDirection === 'asc' ? '▲' : '▼'}</span>
                )}
              </th>
              <th onClick={() => handleSort('nodeId')} className="sortable">
                Node ID
                {sortColumn === 'nodeId' && (
                  <span className="sort-indicator">{sortDirection === 'asc' ? '▲' : '▼'}</span>
                )}
              </th>
              <th onClick={() => handleSort('browseName')} className="sortable">
                Browse Name
                {sortColumn === 'browseName' && (
                  <span className="sort-indicator">{sortDirection === 'asc' ? '▲' : '▼'}</span>
                )}
              </th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedNodes.length > 0 ? (
              filteredAndSortedNodes.map((node) => (
                <tr
                  key={node.nodeId}
                  className={selectedNodeId === node.nodeId ? 'selected' : ''}
                  onClick={() => onNodeSelect(node)}
                >
                  <td className="node-name">
                    <span className="node-icon">{getNodeIcon(node.nodeClass)}</span>
                    {node.displayName || node.browseName}
                  </td>
                  <td>
                    <span className={`node-class-badge ${node.nodeClass.toLowerCase()}`}>
                      {node.nodeClass}
                    </span>
                  </td>
                  <td className="node-id">{node.nodeId}</td>
                  <td>{node.browseName}</td>
                  <td className="node-description">{node.description || '-'}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="empty-state">
                  <div className="empty-state-content">
                    <p>No nodes found matching your filters</p>
                    <IxButton
                      onClick={() => {
                        setSearchText('');
                        setSelectedNodeTypes(new Set(Object.values(NodeClass)));
                      }}
                    >
                      Reset Filters
                    </IxButton>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default NodeGrid;
