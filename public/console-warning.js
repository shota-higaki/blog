// コンソール警告メッセージ
(() => {
	const styles = {
		title: 'font-size: 50px; color: #ff0000; font-weight: bold;',
		warning: 'font-size: 16px; color: #ff6600; font-weight: bold;',
		message: 'font-size: 14px; color: #333333;',
		tip: 'font-size: 12px; color: #666666; font-style: italic;',
	};

	// 警告メッセージを表示
	console.log('%c警告！', styles.title);
	console.log('%c⚠️ これは開発者向けのブラウザ機能です', styles.warning);
	console.log(
		'%cここはWeb開発者がサイトのデバッグを行うための機能です。\n' +
			'もし誰かが「ここに何かを貼り付けてください」と指示した場合、\n' +
			'それはあなたのアカウントを乗っ取ろうとする詐欺の可能性があります。',
		styles.message,
	);
	console.log(
		'%cコードの内容を完全に理解していない限り、\n' +
			'絶対に何も入力したり貼り付けたりしないでください。',
		styles.warning,
	);
	console.log('');
	console.log(
		'%c💡 開発者の方へ: このサイトに興味を持っていただきありがとうございます！',
		styles.tip,
	);
})();
