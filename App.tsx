
import React, { useState, useCallback } from 'react';
import { generateRecipe, generateDishImage, editDishImage, RecipeResult } from './services/geminiService';

// Check for API Key availability safely, preventing crashes in environments where `process` is not defined.
const isApiKeyAvailable = typeof process !== 'undefined' && process.env && !!process.env.API_KEY;

const ApiKeyWarning: React.FC = () => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-rose-50 text-center p-8">
    <div className="bg-white p-10 rounded-2xl shadow-xl max-w-2xl border border-rose-100">
      <svg className="w-16 h-16 text-rose-400 mx-auto mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
      <h1 className="text-3xl font-bold text-gray-800 mb-3">API 키 설정이 필요합니다</h1>
      <p className="text-gray-600 mb-8 max-w-lg mx-auto">
        이 앱의 핵심 AI 기능을 사용하려면 Google Gemini API 키가 필요합니다. 아래의 간단한 두 단계를 따라 설정해주세요.
      </p>
      <div className="space-y-6 text-left">
        {/* Step 1: Get API Key */}
        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
          <h2 className="text-lg font-bold text-gray-700 mb-3">1단계: Gemini API 키 발급받기</h2>
          <p className="text-gray-600 mb-4">
            Google AI Studio에 방문하여 새로운 API 키를 생성하세요. 개인적인 학습 및 테스트 목적이라면 무료로 사용 가능합니다.
          </p>
          <a
            href="https://aistudio.google.com/app/apikey"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block w-full text-center px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-lg transition-all active:scale-95 shadow-lg shadow-blue-100"
          >
            Google AI Studio로 이동하여 키 받기
          </a>
           <p className="text-xs text-gray-500 mt-3">
            페이지에서 'Create API key in new project' 버튼을 클릭하고 생성된 키를 복사해두세요.
          </p>
        </div>

        {/* Step 2: Set API Key in Vercel */}
        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
          <h2 className="text-lg font-bold text-gray-700 mb-3">2단계: Vercel에 API 키 등록하기</h2>
           <p className="text-gray-600 mb-4">
            복사한 API 키를 Vercel 프로젝트의 환경 변수로 추가해야 앱이 키를 안전하게 사용할 수 있습니다.
          </p>
          <div className="bg-white p-4 rounded-lg text-sm border">
            <p className="font-semibold text-gray-700">1. Vercel 프로젝트 {'>'} Settings {'>'} Environment Variables 로 이동하세요.</p>
            <p className="mt-2">2. 이름(Name)에 <code className="bg-gray-200 px-2 py-1 rounded-md text-red-500 font-mono">API_KEY</code> 를 입력하세요.</p>
            <p className="mt-2">3. 값(Value)에 1단계에서 복사한 API 키를 붙여넣고 저장하세요.</p>
          </div>
          <p className="mt-4 text-xs text-gray-500">
            <strong>중요:</strong> 설정 후 변경사항이 적용되도록 Vercel 프로젝트를 다시 배포(Redeploy)해야 할 수 있습니다.
          </p>
        </div>
      </div>
    </div>
  </div>
);


const App: React.FC = () => {
  const [ingredients, setIngredients] = useState<string>('');
  const [recipe, setRecipe] = useState<RecipeResult | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [editPrompt, setEditPrompt] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isImageLoading, setIsImageLoading] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);

  const handleRecommend = useCallback(async () => {
    if (!ingredients.trim()) return;

    setIsLoading(true);
    setRecipe(null);
    setImageUrl(null);

    try {
      const result = await generateRecipe(ingredients);
      if (result) {
        setRecipe(result);
        setIsImageLoading(true);
        const img = await generateDishImage(result.title);
        setImageUrl(img);
      }
    } catch (error) {
      console.error("Error generating recommendation:", error);
      alert("추천을 불러오는 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
      setIsImageLoading(false);
    }
  }, [ingredients]);

  const handleEditImage = useCallback(async () => {
    if (!imageUrl || !editPrompt.trim()) return;

    setIsEditing(true);
    try {
      const editedImg = await editDishImage(imageUrl, editPrompt);
      if (editedImg) {
        setImageUrl(editedImg);
        setEditPrompt('');
      }
    } catch (error) {
      console.error("Error editing image:", error);
      alert("이미지 편집 중 오류가 발생했습니다.");
    } finally {
      setIsEditing(false);
    }
  }, [imageUrl, editPrompt]);
  
  if (!isApiKeyAvailable) {
    return <ApiKeyWarning />;
  }

  return (
    <div className="min-h-screen p-4 md:p-8 flex flex-col items-center bg-[#fdfcfb]">
      <div className="w-full max-w-2xl bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-gray-100">
        {/* Premium Header Section */}
        <div className="relative p-8 md:p-12 bg-gradient-to-br from-[#ff8a5c] via-[#ff5e62] to-[#ff4b2b] text-white overflow-hidden">
          <div className="relative z-10 max-w-[70%]">
            <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-widest mb-3 border border-white/30">
              AI Smart Kitchen
            </span>
            <h1 className="text-4xl font-extrabold mb-3 leading-tight tracking-tight">
              재료를 <br/>입력하세요
            </h1>
            <p className="text-orange-50 text-sm opacity-90 leading-relaxed font-medium">
              냉장고 속 잠자고 있는 재료로<br/>
              나만을 위한 특별한 미식을 완성합니다.
            </p>
          </div>
          
          {/* Main Top-Right Professional Image Area */}
          <div className="absolute -top-4 -right-4 md:top-0 md:right-0 w-48 h-48 md:w-64 md:h-64 flex items-center justify-center translate-x-10 -translate-y-10 md:translate-x-16 md:-translate-y-16">
             <div className="relative w-full h-full">
                {/* Decorative circles */}
                <div className="absolute inset-0 bg-white/10 rounded-full animate-pulse"></div>
                <div className="absolute inset-4 bg-white/5 rounded-full border border-white/20"></div>
                
                {/* The Featured Image */}
                <div className="absolute inset-8 rounded-3xl overflow-hidden shadow-2xl border-4 border-white/40 rotate-6 transform hover:rotate-0 transition-all duration-700 bg-white/20 backdrop-blur-lg group">
                  <img 
                    src="https://ibb.co/VpwJ5x7W" 
                    alt="Chef's Special" 
                    className="w-full h-full object-cover scale-110 group-hover:scale-100 transition-transform duration-700"
                    onError={(e) => {
                      // Fallback to a high-quality chef icon if the link is not a direct image
                      e.currentTarget.src = "https://www.gstatic.com/lamda/images/gemini_sparkle_v002_d4735304651c050a78117.svg";
                      e.currentTarget.className = "w-1/2 h-1/2 m-auto absolute inset-0 opacity-90 invert p-2";
                    }}
                  />
                </div>
             </div>
          </div>
          
          {/* Abstract background elements */}
          <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-black/10 to-transparent pointer-events-none"></div>
        </div>

        {/* Floating Input Section */}
        <div className="px-8 -mt-6 relative z-20">
          <div className="bg-white p-2 rounded-2xl shadow-xl border border-gray-100 flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              className="flex-1 px-5 py-4 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-orange-400 outline-none transition-all text-gray-700 font-medium placeholder:text-gray-400"
              placeholder="달걀, 대파, 우유..."
              value={ingredients}
              onChange={(e) => setIngredients(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleRecommend()}
            />
            <button
              onClick={handleRecommend}
              disabled={isLoading || !ingredients.trim()}
              className="px-8 py-4 bg-[#ff5e62] hover:bg-[#ff4b2b] text-white font-bold rounded-xl transition-all active:scale-95 disabled:opacity-50 shadow-lg shadow-rose-200 whitespace-nowrap"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>분석 중</span>
                </div>
              ) : '레시피 추천받기'}
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-8 space-y-10">
          {recipe ? (
            <div className="animate-fade-in space-y-8">
              <div className="border-l-4 border-[#ff5e62] pl-6 py-2">
                <h2 className="text-3xl font-black text-gray-800 tracking-tight">{recipe.title}</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-orange-50/50 p-6 rounded-2xl border border-orange-100">
                  <h3 className="text-sm font-bold text-orange-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 bg-orange-500 rounded-full"></span> 준비 재료
                  </h3>
                  <ul className="space-y-2 text-gray-700 font-medium">
                    {recipe.ingredients.map((item, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <span className="text-orange-400">•</span> {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-rose-50/50 p-6 rounded-2xl border border-rose-100">
                  <h3 className="text-sm font-bold text-rose-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 bg-rose-500 rounded-full"></span> 셰프의 팁
                  </h3>
                  <p className="text-gray-700 italic leading-relaxed font-medium">"{recipe.tips}"</p>
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <span className="bg-gray-800 text-white w-8 h-8 rounded-lg flex items-center justify-center text-sm">Chef</span> 조리 가이드
                </h3>
                <div className="grid gap-4">
                  {recipe.steps.map((step, idx) => (
                    <div key={idx} className="group flex gap-5 p-5 rounded-2xl bg-white border border-gray-100 hover:border-orange-200 hover:shadow-md transition-all">
                      <span className="flex-shrink-0 w-8 h-8 bg-gray-100 text-gray-500 group-hover:bg-orange-500 group-hover:text-white rounded-xl flex items-center justify-center font-bold transition-colors">
                        {idx + 1}
                      </span>
                      <p className="text-gray-700 leading-relaxed font-medium pt-1">{step}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="py-20 flex flex-col items-center justify-center text-center opacity-40">
               <div className="w-20 h-20 mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                  </svg>
               </div>
               <p className="text-gray-400 font-medium tracking-wide">AI 셰프가 당신의 재료를 기다리고 있습니다.</p>
            </div>
          )}
        </div>

        {/* AI Visualization Area */}
        {(recipe || isImageLoading) && (
          <div className="px-8 pb-12">
            <div className="relative group rounded-3xl overflow-hidden bg-gray-50 border border-gray-100 aspect-[4/3] w-full flex items-center justify-center shadow-inner">
              {isImageLoading ? (
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 border-4 border-orange-100 border-t-orange-500 rounded-full animate-spin"></div>
                  <p className="mt-4 text-sm font-bold text-gray-400 animate-pulse">이미지 플레이팅 중...</p>
                </div>
              ) : imageUrl ? (
                <>
                  <img
                    src={imageUrl}
                    alt="Recipe Vision"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                    <span className="text-white text-xs font-bold bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/30">Gemini 2.5 Flash Image Generative AI</span>
                  </div>
                </>
              ) : null}
              
              {isEditing && (
                <div className="absolute inset-0 bg-white/70 backdrop-blur-md flex flex-col items-center justify-center z-30">
                  <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div>
                  <p className="mt-4 text-sm font-black text-orange-600">셰프의 손길로 수정 중...</p>
                </div>
              )}
            </div>

            {imageUrl && (
              <div className="mt-6 p-6 bg-gray-50 rounded-2xl border border-gray-100">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest text-center mb-4">AI Image Customizer</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="예: 더 매콤하게 보여줘, 파슬리 가루 뿌려줘..."
                    className="flex-1 px-4 py-3 text-sm rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-300 outline-none transition-all"
                    value={editPrompt}
                    onChange={(e) => setEditPrompt(e.target.value)}
                    disabled={isEditing}
                    onKeyDown={(e) => e.key === 'Enter' && handleEditImage()}
                  />
                  <button
                    onClick={handleEditImage}
                    disabled={isEditing || !editPrompt.trim()}
                    className="px-6 py-3 bg-gray-800 text-white text-sm font-bold rounded-xl hover:bg-black transition-all disabled:opacity-30 shadow-lg"
                  >
                    수정 요청
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Premium Footer */}
      <footer className="mt-12 text-center pb-8">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="h-[1px] w-8 bg-gray-200"></div>
          <span className="text-[10px] font-bold text-gray-300 uppercase tracking-[0.3em]">Excellence in AI</span>
          <div className="h-[1px] w-8 bg-gray-200"></div>
        </div>
        <p className="text-gray-400 text-xs font-medium">© 2024 CHEF NANO. POWERED BY GOOGLE GEMINI FLASH SERIES.</p>
      </footer>
    </div>
  );
};

export default App;
