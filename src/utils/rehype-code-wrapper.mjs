import { visit } from 'unist-util-visit';

export function rehypeCodeWrapper() {
	return (tree) => {
		visit(tree, 'element', (node, index, parent) => {
			// pre要素を探す
			if (node.tagName !== 'pre') return;

			// pre要素内のcode要素を探す
			const codeElement = node.children?.find(
				(child) => child.type === 'element' && child.tagName === 'code',
			);

			if (!codeElement) return;

			// 言語を取得
			const className = codeElement.properties?.className?.[0];
			const lang = className?.replace('language-', '') || '';

			// ユニークなIDを生成
			const id = Math.random().toString(36).substring(2, 9);

			// ラッパーdivを作成
			const wrapper = {
				type: 'element',
				tagName: 'div',
				properties: {
					className: ['code-block-wrapper'],
					'data-code-block-id': id,
				},
				children: [
					// 言語表示
					lang && {
						type: 'element',
						tagName: 'div',
						properties: { className: ['code-language'] },
						children: [{ type: 'text', value: lang }],
					},
					// コピーボタン
					{
						type: 'element',
						tagName: 'button',
						properties: {
							type: 'button',
							className: ['copy-button'],
							'data-code-block-id': id,
							'aria-label': 'コードをコピー',
							title: 'コードをコピー',
						},
						children: [
							// コピーアイコン
							{
								type: 'element',
								tagName: 'svg',
								properties: {
									className: ['copy-icon'],
									xmlns: 'http://www.w3.org/2000/svg',
									width: '20',
									height: '20',
									viewBox: '0 0 24 24',
									fill: 'none',
									stroke: 'currentColor',
									'stroke-width': '2',
									'stroke-linecap': 'round',
									'stroke-linejoin': 'round',
								},
								children: [
									{
										type: 'element',
										tagName: 'rect',
										properties: {
											x: '9',
											y: '9',
											width: '13',
											height: '13',
											rx: '2',
											ry: '2',
										},
									},
									{
										type: 'element',
										tagName: 'path',
										properties: {
											d: 'M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1',
										},
									},
								],
							},
							// チェックアイコン
							{
								type: 'element',
								tagName: 'svg',
								properties: {
									className: ['check-icon'],
									xmlns: 'http://www.w3.org/2000/svg',
									width: '20',
									height: '20',
									viewBox: '0 0 24 24',
									fill: 'none',
									stroke: 'currentColor',
									'stroke-width': '2',
									'stroke-linecap': 'round',
									'stroke-linejoin': 'round',
									style: 'display: none;',
								},
								children: [
									{
										type: 'element',
										tagName: 'polyline',
										properties: {
											points: '20 6 9 17 4 12',
										},
									},
								],
							},
						],
					},
					// 元のpre要素
					node,
				].filter(Boolean),
			};

			// 親要素内でpre要素をラッパーで置き換える
			if (parent && typeof index === 'number') {
				parent.children[index] = wrapper;
			}
		});
	};
}
