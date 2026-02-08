'use client'

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function TestPage() {
	const [status, setStatus] = useState('テスト中....');

	useEffect(() => {
		async function test() {
			const { data, error } = await supabase
				.from('rankings')
				.select('*')
				.limit(1);
			if (error) {
				setStatus(`エラー：${error.message}`);
			} else {
				setStatus(`接続成功！データ件数： ${data.length}`);
			}
		}
		test();
	}, []);

	return <div className="p-8 text-2xl">{status}</div>;
}
