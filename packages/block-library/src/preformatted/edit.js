/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import {
	RichText,
	__experimentalBlock as Block,
} from '@wordpress/block-editor';

export default function PreformattedEdit( {
	attributes,
	mergeBlocks,
	setAttributes,
	className,
	style,
} ) {
	const { content } = attributes;

	return (
		<RichText
			tagName={ Block.pre }
			identifier="content"
			preserveWhiteSpace
			value={ content }
			onChange={ ( nextContent ) => {
				setAttributes( {
					content: nextContent,
				} );
			} }
			placeholder={ __( 'Write preformatted text…' ) }
			className={ className }
			style={ style }
			onMerge={ mergeBlocks }
		/>
	);
}
