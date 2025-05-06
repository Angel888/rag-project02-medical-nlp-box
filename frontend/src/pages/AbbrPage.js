import React, { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { LLMOptions, EmbeddingOptions, TextInput } from '../components/shared/ModelOptions';

const AbbrPage = () => {
  const [input, setInput] = useState('');
  const [context, setContext] = useState('');
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Method selection
  const [method, setMethod] = useState('simple_ollama');
  const methods = {
    simple_ollama: '简单大语言模型展开（快速）',
    llm_rank_query_db: '大语言模型展开 + 数据库标准化（更准确）'
  };

  // LLM options
  const [llmOptions, setLlmOptions] = useState({
    provider: 'ollama',
    model: 'qwen2.5:7b'
  });

  // Vector DB options
  const [embeddingOptions, setEmbeddingOptions] = useState({
    provider: 'huggingface',
    model: 'BAAI/bge-m3',
    dbName: 'snomed_bge_m3',
    collectionName: 'concepts_only_name'
  });

  const handleLlmOptionChange = (e) => {
    const { name, value } = e.target;
    setLlmOptions(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEmbeddingOptionChange = (e) => {
    const { name, value } = e.target;
    setEmbeddingOptions(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:8001/api/abbr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: input,
          context,
          method,
          llmOptions,
          embeddingOptions
        }),
      });
      const data = await response.json();
      setResult(JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('Error:', error);
      setResult('An error occurred while processing the request.');
    }
    setIsLoading(false);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">医疗缩写展开 📝</h1>
      
      <div className="grid grid-cols-3 gap-6">
        {/* Left panel: Text inputs */}
        <div className="col-span-2 bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">输入医疗记录</h2>
          <TextInput
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="请输入包含缩写的医疗记录..."
          />

          {method !== 'simple_ollama' && (
            <TextInput
              value={context}
              onChange={(e) => setContext(e.target.value)}
              rows={2}
              placeholder="输入上下文以获得更好的缩写展开效果..."
            />
          )}

          <button
            onClick={handleSubmit}
            className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 w-full"
            disabled={isLoading}
          >
            {isLoading ? '处理中...' : '展开缩写'}
          </button>
        </div>

        {/* Right panel: Options */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">选项</h2>
          
          {/* Method Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">展开方法</label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            >
              {Object.entries(methods).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>

          {/* LLM Options */}
          <LLMOptions options={llmOptions} onChange={handleLlmOptionChange} />

          {/* Vector DB Options */}
          {method !== 'simple_ollama' && (
            <EmbeddingOptions options={embeddingOptions} onChange={handleEmbeddingOptionChange} />
          )}
        </div>
      </div>

      {/* Results */}
      {result && (
        <div className="mt-6">
          <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mb-6" role="alert">
            <p className="font-bold">结果：</p>
            <pre className="whitespace-pre-wrap">{result}</pre>
          </div>
        </div>
      )}

      <div className="flex items-center text-yellow-700 bg-yellow-100 p-4 rounded-md mt-6">
        <AlertCircle className="mr-2" />
        <span>这是演示版本, 并非所有功能都可以正常工作。更多功能需要您来增强并实现。</span>
      </div>
    </div>
  );
};

export default AbbrPage; 