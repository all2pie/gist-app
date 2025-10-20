interface CodeViewerProps {
  code: string;
  filename?: string;
  className?: string;
  isLoading?: boolean;
  maxHeight?: string;
  minHeight?: string;
}

export const CodeViewer: React.FC<CodeViewerProps> = ({
  code,
  className = '',
  isLoading = false,
  maxHeight = '200px',
  minHeight = '120px',
}) => {
  if (isLoading) {
    return (
      <div
        className={`bg-gray-50 flex items-center justify-center ${className}`}
        style={{ minHeight }}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-600 mx-auto mb-2"></div>
          <span className="text-sm text-gray-500">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <pre
        className="text-sm font-mono bg-gray-50 overflow-auto p-4 m-0 text-gray-800"
        style={{
          maxHeight,
          minHeight,
          lineHeight: '1.5',
        }}
      >
        {code}
      </pre>
    </div>
  );
};
