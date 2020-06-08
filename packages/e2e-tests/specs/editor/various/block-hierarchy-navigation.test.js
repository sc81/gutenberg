/**
 * WordPress dependencies
 */
import {
	createNewPost,
	insertBlock,
	getEditedPostContent,
	pressKeyTimes,
	pressKeyWithModifier,
	openDocumentSettingsSidebar,
} from '@wordpress/e2e-test-utils';

async function openBlockNavigator() {
	await pressKeyWithModifier( 'access', 'o' );
	await page.waitForSelector(
		'.block-editor-block-navigation-leaf.is-selected'
	);
}

describe( 'Navigating the block hierarchy', () => {
	beforeEach( async () => {
		await createNewPost();
	} );

	it( 'should navigate using the block hierarchy dropdown menu', async () => {
		await insertBlock( 'Columns' );
		await page.click( '[aria-label="Two columns; equal split"]' );

		// Add a paragraph in the first column.
		await page.keyboard.press( 'Tab' ); // Tab to inserter.
		await page.keyboard.press( 'Enter' ); // Activate inserter.
		await page.keyboard.type( 'Paragraph' );
		await pressKeyTimes( 'Tab', 3 ); // Tab to paragraph result.
		await page.keyboard.press( 'Enter' ); // Insert paragraph.
		await page.keyboard.type( 'First column' );

		// Navigate to the columns blocks.
		await page.click( '[aria-label="Block navigation"]' );
		const columnsBlockMenuItem = (
			await page.$x(
				"//button[contains(@class,'block-editor-block-navigation-block-select-button') and contains(text(), 'Columns')]"
			)
		 )[ 0 ];
		await columnsBlockMenuItem.click();

		// Tweak the columns count.
		await openDocumentSettingsSidebar();
		await page.focus(
			'.block-editor-block-inspector [aria-label="Columns"][type="number"]'
		);
		await page.keyboard.down( 'Shift' );
		await page.keyboard.press( 'ArrowLeft' );
		await page.keyboard.up( 'Shift' );
		await page.keyboard.type( '3' );

		// Navigate to the last column block.
		await page.click( '[aria-label="Block navigation"]' );
		const lastColumnsBlockMenuItem = (
			await page.$x(
				"//button[contains(@class,'block-editor-block-navigation-block-select-button') and contains(text(), 'Column')]"
			)
		 )[ 3 ];
		await lastColumnsBlockMenuItem.click();

		// Insert text in the last column block.
		await page.keyboard.press( 'Tab' ); // Tab to inserter.
		await page.keyboard.press( 'Enter' ); // Activate inserter.
		await page.keyboard.type( 'Paragraph' );
		await pressKeyTimes( 'Tab', 3 ); // Tab to paragraph result.
		await page.keyboard.press( 'Enter' ); // Insert paragraph.
		await page.keyboard.type( 'Third column' );

		expect( await getEditedPostContent() ).toMatchSnapshot();
	} );

	it( 'should navigate block hierarchy using only the keyboard', async () => {
		await insertBlock( 'Columns' );
		await openDocumentSettingsSidebar();
		await page.click( '[aria-label="Two columns; equal split"]' );

		// Add a paragraph in the first column.
		await page.keyboard.press( 'Tab' ); // Tab to inserter.
		await page.keyboard.press( 'Enter' ); // Activate inserter.
		await page.keyboard.type( 'Paragraph' );
		await pressKeyTimes( 'Tab', 3 ); // Tab to paragraph result.
		await page.keyboard.press( 'Enter' ); // Insert paragraph.
		await page.keyboard.type( 'First column' );

		// Navigate to the columns blocks using the keyboard.
		await openBlockNavigator();
		await page.keyboard.press( 'Enter' );

		// Move focus to the sidebar area.
		await pressKeyWithModifier( 'ctrl', '`' );
		await pressKeyWithModifier( 'ctrl', '`' );
		await pressKeyWithModifier( 'ctrl', '`' );
		await pressKeyTimes( 'Tab', 5 );

		// Tweak the columns count by increasing it by one.
		await page.keyboard.press( 'ArrowRight' );

		// Navigate to the last column in the columns block.
		await openBlockNavigator();
		await pressKeyTimes( 'ArrowDown', 4 );
		await page.keyboard.press( 'Enter' );
		await page.waitForSelector( '.is-selected[data-type="core/column"]' );

		// Insert text in the last column block
		await page.keyboard.press( 'Tab' ); // Tab to inserter.
		await page.keyboard.press( 'Enter' ); // Activate inserter.
		await page.keyboard.type( 'Paragraph' );
		await pressKeyTimes( 'Tab', 3 ); // Tab to paragraph result.
		await page.keyboard.press( 'Enter' ); // Insert paragraph.
		await page.keyboard.type( 'Third column' );

		expect( await getEditedPostContent() ).toMatchSnapshot();
	} );

	it( 'should appear and function even without nested blocks', async () => {
		const textString = 'You say goodbye';

		await insertBlock( 'Paragraph' );

		// Add content so there is a block in the hierarchy.
		await page.keyboard.type( textString );

		// Create an image block too.
		await page.keyboard.press( 'Enter' );
		await insertBlock( 'Image' );

		// Return to first block.
		await openBlockNavigator();
		await page.keyboard.press( 'Space' );

		// Replace its content.
		await pressKeyWithModifier( 'primary', 'a' );
		await page.keyboard.type( 'and I say hello' );

		expect( await getEditedPostContent() ).toMatchSnapshot();
	} );

	it( 'should select the wrapper div for a group ', async () => {
		// Insert a group block
		await insertBlock( 'Group' );

		// Insert some random blocks.
		// The last block shouldn't be a textual block.
		await page.click( '.block-list-appender .block-editor-inserter' );
		const paragraphMenuItem = (
			await page.$x( `//button//span[contains(text(), 'Paragraph')]` )
		 )[ 0 ];
		await paragraphMenuItem.click();
		await page.keyboard.type( 'just a paragraph' );
		await insertBlock( 'Separator' );

		// Check the Group block content
		expect( await getEditedPostContent() ).toMatchSnapshot();

		// Unselect the blocks
		await page.click( '.editor-post-title' );

		// Try selecting the group block using the block navigation
		await page.click( '[aria-label="Block navigation"]' );
		const groupMenuItem = (
			await page.$x(
				"//button[contains(@class,'block-editor-block-navigation-block-select-button') and contains(text(), 'Group')]"
			)
		 )[ 0 ];
		await groupMenuItem.click();

		// The group block's wrapper should be selected.
		const isGroupBlockSelected = await page.evaluate(
			() =>
				document.activeElement.getAttribute( 'data-type' ) ===
				'core/group'
		);
		expect( isGroupBlockSelected ).toBe( true );
	} );
} );
