import React, { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { EmbeddingOptions, TextInput } from '../components/shared/ModelOptions';

const StdPage = () => {
  const [input, setInput] = useState('');
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // 重新组织选项结构，默认选中所有选项
  const [options, setOptions] = useState({
    disease: true,
    combineBioStructure: true,
    medicine: true,
    laboratory: true,
    physicalExamination: true,
    surgeryProcedure: true,
    radiology: true,
    commonMedicalObservations: true,
    lifestyleObservations: true,
    cognitiveBehaviorItems: true,
    allMedicalTerms: true,
  });

  const [embeddingOptions, setEmbeddingOptions] = useState({
    provider: 'huggingface',
    model: 'BAAI/bge-m3',
    dbName: 'snomed_bge_m3',
    collectionName: 'concepts_only_name'
  });

  const handleOptionChange = (e) => {
    const { name, checked } = e.target;
    
    if (name === 'allMedicalTerms') {
      // 如果选择 allMedicalTerms，则设置所有选项为相同状态
      setOptions(prevOptions => {
        const newOptions = {};
        Object.keys(prevOptions).forEach(key => {
          newOptions[key] = checked;
        });
        return newOptions;
      });
    } else {
      // 更新单个选项
      setOptions(prevOptions => ({
        ...prevOptions,
        [name]: checked,
        // 如果取消选择任何一个选项，allMedicalTerms 也取消选择
        allMedicalTerms: checked && 
          Object.entries(prevOptions)
            .filter(([key]) => key !== 'allMedicalTerms' && key !== name)
            .every(([, value]) => value)
      }));
    }
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
    setError('');
    setResult('');
    try {
      const response = await fetch('http://127.0.0.1:8001/api/std', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          text: input, 
          options,
          embeddingOptions 
        }),
      });
      const data = await response.json();
      setResult(JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('Error:', error);
      setError(`An error occurred: ${error.message}`);
    }
    setIsLoading(false);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">医疗术语标准化 📚</h1>
      <div className="grid grid-cols-3 gap-6">
        {/* 左侧面板：文本输入和嵌入选项 */}
        <div className="col-span-2 bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">输入医疗术语</h2>
          <TextInput
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={4}
            placeholder="请输入需要标准化的医疗术语..."
          />
          
          <EmbeddingOptions options={embeddingOptions} onChange={handleEmbeddingOptionChange} />

          <button
            onClick={handleSubmit}
            className="bg-purple-500 text-white px-4 py-2 rounded-md hover:bg-purple-600 w-full"
            disabled={isLoading}
          >
            {isLoading ? '处理中...' : '标准化术语'}
          </button>
        </div>

        {/* 右侧面板：选项列表 */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">术语类型</h2>
          <div className="space-y-3">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="disease"
                name="disease"
                checked={options.disease}
                onChange={handleOptionChange}
                className="mr-2"
              />
              <label htmlFor="disease">疾病</label>
              {options.disease && (
                <div className="ml-6">
                  <input
                    type="checkbox"
                    id="combineBioStructure"
                    name="combineBioStructure"
                    checked={options.combineBioStructure}
                    onChange={handleOptionChange}
                    className="mr-2"
                  />
                  <label htmlFor="combineBioStructure">合并生物结构</label>
                </div>
              )}
            </div>
            
            {[
              ['medicine', '药物'],
              ['laboratory', '实验室检查'],
              ['physicalExamination', '体格检查'],
              ['surgeryProcedure', '手术/操作'],
              ['radiology', '放射检查'],
              ['commonMedicalObservations', '常见医学观察'],
              ['lifestyleObservations', '生活方式观察'],
              ['cognitiveBehaviorItems', '认知行为项目'],
            ].map(([key, label]) => (
              <div key={key} className="flex items-center">
                <input
                  type="checkbox"
                  id={key}
                  name={key}
                  checked={options[key]}
                  onChange={handleOptionChange}
                  className="mr-2"
                />
                <label htmlFor={key}>{label}</label>
              </div>
            ))}
            
            <div className="flex items-center pt-4 border-t">
              <input
                type="checkbox"
                id="allMedicalTerms"
                name="allMedicalTerms"
                checked={options.allMedicalTerms}
                onChange={handleOptionChange}
                className="mr-2"
              />
              <label htmlFor="allMedicalTerms" className="font-semibold">所有医疗术语</label>
            </div>
          </div>
        </div>
      </div>
      
      {/* 结果显示区域 */}
      {(error || result) && (
        <div className="mt-6">
          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
              <p className="font-bold">错误：</p>
              <p>{error}</p>
            </div>
          )}
          {result && (
            <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6" role="alert">
              <p className="font-bold">结果：</p>
              <pre>{result}</pre>
            </div>
          )}
        </div>
      )}

      <div className="flex items-center text-yellow-700 bg-yellow-100 p-4 rounded-md mt-6">
        <AlertCircle className="mr-2" />
        <span>这是演示版本, 并非所有功能都可以正常工作。更多功能需要您来增强并实现。</span>
      </div>
    </div>
  );
};

export default StdPage;