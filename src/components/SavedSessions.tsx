'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { SavedSession } from '@/types';
import { formatNumber, formatTime } from '@/lib/calculator';
import {
  Trash2,
  FolderOpen,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Eye,
} from 'lucide-react';

interface SavedSessionsProps {
  sessions: SavedSession[];
  onDeleteSession: (id: string) => void;
  onClearAllSessions: () => void;
}

export function SavedSessions({
  sessions,
  onDeleteSession,
  onClearAllSessions,
}: SavedSessionsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedSession, setSelectedSession] = useState<SavedSession | null>(null);
  const [deleteSessionId, setDeleteSessionId] = useState<string | null>(null);
  const [showClearAllDialog, setShowClearAllDialog] = useState(false);

  // 共有用テキストを生成
  const generateShareText = (session: SavedSession) => {
    const { statistics, plays, settings } = session;
    const elapsedTimeFormatted = formatTime(session.elapsedSeconds);
    const savedDate = new Date(session.savedAt).toLocaleString('ja-JP');

    const playDetails = plays
      .map((play, index) => {
        const earnedCoins = Math.round(play.rawCoins * settings.coinMultiplier);
        return `${index + 1}回目: ${formatNumber(play.rawCoins)} → ${formatNumber(earnedCoins)}`;
      })
      .join('\n');

    const tsumName = settings.usedTsum ? `使用ツム: ${settings.usedTsum}\n` : '';

    return `【ツムツム 30分効率】
記録日時: ${savedDate}
${tsumName}
■ 結果
30分効率: ${formatNumber(statistics.efficiency30min)} コイン
1分効率: ${formatNumber(statistics.efficiency1min)} コイン

■ サマリー
プレイ回数: ${statistics.playCount} 回
経過時間: ${elapsedTimeFormatted}
総素コイン: ${formatNumber(statistics.totalRawCoins)}
総獲得コイン: ${formatNumber(statistics.totalEarnedCoins)}
アイテムコスト: ${formatNumber(statistics.totalItemCost)}
実質獲得: ${formatNumber(statistics.netCoins)} コイン

■ プレイ詳細（素コイン → 獲得）
${playDetails || 'なし'}

#ツムツム #効率計算`;
  };

  // コピー
  const handleCopy = async (session: SavedSession) => {
    const text = generateShareText(session);
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(session.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      console.error('Copy failed:', error);
    }
  };

  // LINE共有
  const handleLineShare = (session: SavedSession) => {
    const text = generateShareText(session);
    const lineUrl = `https://line.me/R/share?text=${encodeURIComponent(text)}`;
    window.open(lineUrl, '_blank');
  };

  if (sessions.length === 0) {
    return null;
  }

  return (
    <>
      <Card>
        <CardHeader
          className="cursor-pointer select-none pb-3"
          onClick={() => setIsOpen(!isOpen)}
        >
          <CardTitle className="flex items-center justify-between text-lg">
            <span className="flex items-center gap-2">
              <FolderOpen className="w-5 h-5" />
              保存済みセッション ({sessions.length})
            </span>
            {isOpen ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </CardTitle>
        </CardHeader>

        {isOpen && (
          <CardContent className="space-y-3">
            {sessions.map((session) => {
              const date = new Date(session.savedAt);
              const dateStr = date.toLocaleDateString('ja-JP');
              const timeStr = date.toLocaleTimeString('ja-JP', {
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={session.id}
                  className="border rounded-lg p-3 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">
                        {session.settings.usedTsum && (
                          <span className="text-sky-600 mr-2">{session.settings.usedTsum}</span>
                        )}
                        30分効率: {formatNumber(session.statistics.efficiency30min)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {dateStr} {timeStr} / {session.statistics.playCount}回プレイ
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteSessionId(session.id)}
                      className="text-muted-foreground hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedSession(session)}
                      className="flex-1"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      詳細
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopy(session)}
                      className="flex-1"
                    >
                      {copiedId === session.id ? (
                        <Check className="w-4 h-4 mr-1 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4 mr-1" />
                      )}
                      {copiedId === session.id ? 'コピー済' : 'コピー'}
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleLineShare(session)}
                      className="flex-1 bg-[#06C755] hover:bg-[#05b04c] text-white"
                    >
                      LINE
                    </Button>
                  </div>
                </div>
              );
            })}

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowClearAllDialog(true)}
              className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              全セッション削除
            </Button>
          </CardContent>
        )}
      </Card>

      {/* 詳細モーダル */}
      <Dialog open={!!selectedSession} onOpenChange={() => setSelectedSession(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          {selectedSession && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl">
                  セッション詳細
                  {selectedSession.settings.usedTsum && (
                    <span className="ml-2 text-sky-600">({selectedSession.settings.usedTsum})</span>
                  )}
                </DialogTitle>
                <p className="text-sm text-muted-foreground">
                  {new Date(selectedSession.savedAt).toLocaleString('ja-JP')}
                </p>
              </DialogHeader>

              <div className="space-y-4">
                {/* 効率 */}
                <div className="bg-blue-600 text-white rounded-lg p-4 text-center">
                  <p className="text-sm opacity-80">30分効率</p>
                  <p className="text-3xl font-bold">
                    {formatNumber(selectedSession.statistics.efficiency30min)}
                  </p>
                  <p className="text-sm opacity-80">コイン</p>
                </div>

                {/* サマリー */}
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="bg-gray-100 rounded p-2">
                    <p className="text-muted-foreground">1分効率</p>
                    <p className="font-bold">{formatNumber(selectedSession.statistics.efficiency1min)}</p>
                  </div>
                  <div className="bg-gray-100 rounded p-2">
                    <p className="text-muted-foreground">プレイ回数</p>
                    <p className="font-bold">{selectedSession.statistics.playCount} 回</p>
                  </div>
                  <div className="bg-gray-100 rounded p-2">
                    <p className="text-muted-foreground">経過時間</p>
                    <p className="font-bold">{formatTime(selectedSession.elapsedSeconds)}</p>
                  </div>
                  <div className="bg-gray-100 rounded p-2">
                    <p className="text-muted-foreground">実質獲得</p>
                    <p className="font-bold">{formatNumber(selectedSession.statistics.netCoins)}</p>
                  </div>
                  <div className="bg-gray-100 rounded p-2">
                    <p className="text-muted-foreground">総素コイン</p>
                    <p className="font-bold">{formatNumber(selectedSession.statistics.totalRawCoins)}</p>
                  </div>
                  <div className="bg-gray-100 rounded p-2">
                    <p className="text-muted-foreground">総獲得コイン</p>
                    <p className="font-bold">{formatNumber(selectedSession.statistics.totalEarnedCoins)}</p>
                  </div>
                </div>

                {/* プレイ履歴 */}
                <div>
                  <p className="font-medium mb-2">プレイ履歴</p>
                  <div className="max-h-48 overflow-y-auto border rounded">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12 text-center">No.</TableHead>
                          <TableHead className="text-right">素コイン</TableHead>
                          <TableHead className="text-right">獲得</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedSession.plays.map((play, index) => {
                          const earnedCoins = Math.round(
                            play.rawCoins * selectedSession.settings.coinMultiplier
                          );
                          return (
                            <TableRow key={play.id}>
                              <TableCell className="text-center">{index + 1}</TableCell>
                              <TableCell className="text-right font-mono">
                                {formatNumber(play.rawCoins)}
                              </TableCell>
                              <TableCell className="text-right font-mono text-green-600">
                                {formatNumber(earnedCoins)}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                {/* 共有ボタン */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => handleCopy(selectedSession)}
                    className="flex-1"
                  >
                    {copiedId === selectedSession.id ? (
                      <Check className="w-4 h-4 mr-1 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4 mr-1" />
                    )}
                    {copiedId === selectedSession.id ? 'コピー済' : 'コピー'}
                  </Button>
                  <Button
                    onClick={() => handleLineShare(selectedSession)}
                    className="flex-1 bg-[#06C755] hover:bg-[#05b04c] text-white"
                  >
                    LINE で共有
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* セッション削除確認ダイアログ */}
      <AlertDialog open={!!deleteSessionId} onOpenChange={() => setDeleteSessionId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>セッションを削除しますか？</AlertDialogTitle>
            <AlertDialogDescription>
              このセッションを削除します。この操作は取り消せません。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>キャンセル</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteSessionId) {
                  onDeleteSession(deleteSessionId);
                  setDeleteSessionId(null);
                }
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              削除する
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 全セッション削除確認ダイアログ */}
      <AlertDialog open={showClearAllDialog} onOpenChange={setShowClearAllDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>すべてのセッションを削除しますか？</AlertDialogTitle>
            <AlertDialogDescription>
              {sessions.length}件の保存済みセッションがすべて削除されます。この操作は取り消せません。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>キャンセル</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onClearAllSessions();
                setShowClearAllDialog(false);
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              削除する
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
