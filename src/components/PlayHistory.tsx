'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import { Play, Settings } from '@/types';
import { formatNumber, formatTime } from '@/lib/calculator';
import { Trash2, History } from 'lucide-react';

interface PlayHistoryProps {
  plays: Play[];
  settings: Settings;
  onDeletePlay: (id: string) => void;
  onClearAll: () => void;
}

export function PlayHistory({
  plays,
  settings,
  onDeletePlay,
  onClearAll,
}: PlayHistoryProps) {
  const [showClearDialog, setShowClearDialog] = useState(false);

  if (plays.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          <History className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>プレイ記録がありません</p>
          <p className="text-sm mt-1">素コインを入力して記録を開始しましょう</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <History className="w-5 h-5" />
              プレイ履歴
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowClearDialog(true)}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              全削除
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="max-h-80 overflow-y-auto rounded-md border">
            <Table>
              <TableHeader className="sticky top-0 bg-background">
                <TableRow>
                  <TableHead className="w-16 text-center">No.</TableHead>
                  <TableHead className="text-right">素コイン</TableHead>
                  <TableHead className="text-right">獲得コイン</TableHead>
                  <TableHead className="text-center">経過時間</TableHead>
                  <TableHead className="w-16"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {plays.map((play, index) => {
                  const earnedCoins = Math.round(
                    play.rawCoins * settings.coinMultiplier
                  );
                  return (
                    <TableRow key={play.id}>
                      <TableCell className="text-center font-medium">
                        {index + 1}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {formatNumber(play.rawCoins)}
                      </TableCell>
                      <TableCell className="text-right font-mono text-green-600">
                        {formatNumber(earnedCoins)}
                      </TableCell>
                      <TableCell className="text-center font-mono text-muted-foreground">
                        {formatTime(play.elapsedTime)}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDeletePlay(play.id)}
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* 全削除確認ダイアログ */}
      <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>すべての記録を削除しますか？</AlertDialogTitle>
            <AlertDialogDescription>
              {plays.length}件のプレイ記録がすべて削除されます。この操作は取り消せません。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>キャンセル</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onClearAll();
                setShowClearDialog(false);
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
