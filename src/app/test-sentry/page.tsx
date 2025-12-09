"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import * as Sentry from "@sentry/nextjs";

export default function TestSentryPage() {
  const [errorMessage, setErrorMessage] = useState<string>("");

  // 1. 클라이언트 사이드 에러 발생
  const throwClientError = () => {
    try {
      // @ts-ignore - 의도적으로 타입 에러 발생
      const obj: { prop: string } = null;
      console.log(obj.prop);
    } catch (error) {
      Sentry.captureException(error);
      setErrorMessage("클라이언트 에러가 Sentry에 전송되었습니다!");
    }
  };

  // 2. 비동기 에러 발생
  const throwAsyncError = async () => {
    try {
      await new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error("비동기 에러 테스트: 이것은 테스트용 에러입니다."));
        }, 100);
      });
    } catch (error) {
      Sentry.captureException(error);
      setErrorMessage("비동기 에러가 Sentry에 전송되었습니다!");
    }
  };

  // 3. 수동으로 메시지 전송
  const sendManualMessage = () => {
    Sentry.captureMessage("테스트 메시지: Sentry가 정상적으로 작동하고 있습니다!", "info");
    setErrorMessage("테스트 메시지가 Sentry에 전송되었습니다!");
  };

  // 4. 성능 추적 테스트
  const testPerformance = () => {
    const transaction = Sentry.startTransaction({
      name: "Test Transaction",
      op: "test",
    });

    setTimeout(() => {
      transaction.finish();
      setErrorMessage("성능 추적이 Sentry에 전송되었습니다!");
    }, 500);
  };

  // 5. 사용자 컨텍스트와 함께 에러 전송
  const throwErrorWithContext = () => {
    Sentry.setUser({
      id: "test-user-123",
      username: "test-user",
      email: "test@example.com",
    });

    Sentry.setContext("test-context", {
      page: "test-sentry",
      action: "error-test",
      timestamp: new Date().toISOString(),
    });

    try {
      throw new Error("컨텍스트와 함께 전송되는 테스트 에러");
    } catch (error) {
      Sentry.captureException(error);
      setErrorMessage("컨텍스트와 함께 에러가 Sentry에 전송되었습니다!");
    }
  };

  // 6. 처리되지 않은 에러 (Unhandled Error)
  const throwUnhandledError = () => {
    // 이 에러는 자동으로 Sentry에 캡처됩니다
    throw new Error("처리되지 않은 에러: Sentry가 자동으로 캡처합니다");
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Sentry 테스트 페이지
          </h1>
          <p className="text-gray-600 mb-8">
            아래 버튼들을 클릭하여 다양한 종류의 에러를 Sentry에 전송하고 테스트할 수 있습니다.
          </p>

          {errorMessage && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 font-medium">{errorMessage}</p>
              <p className="text-green-600 text-sm mt-2">
                Sentry 대시보드에서 이벤트를 확인하세요.
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              onClick={throwClientError}
              className="w-full bg-red-600 hover:bg-red-700 text-white"
            >
              클라이언트 에러 발생
            </Button>

            <Button
              onClick={throwAsyncError}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white"
            >
              비동기 에러 발생
            </Button>

            <Button
              onClick={sendManualMessage}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              테스트 메시지 전송
            </Button>

            <Button
              onClick={testPerformance}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white"
            >
              성능 추적 테스트
            </Button>

            <Button
              onClick={throwErrorWithContext}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              컨텍스트와 함께 에러 전송
            </Button>

            <Button
              onClick={throwUnhandledError}
              className="w-full bg-pink-600 hover:bg-pink-700 text-white"
            >
              처리되지 않은 에러 발생
            </Button>
          </div>

          <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h2 className="font-semibold text-yellow-900 mb-2">테스트 후 확인사항:</h2>
            <ul className="list-disc list-inside text-yellow-800 text-sm space-y-1">
              <li>Sentry 대시보드에서 이벤트가 수신되었는지 확인하세요</li>
              <li>에러 스택 트레이스를 확인하세요</li>
              <li>사용자 컨텍스트와 추가 정보가 포함되어 있는지 확인하세요</li>
              <li>성능 추적 데이터가 기록되었는지 확인하세요</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

