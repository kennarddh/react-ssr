import { FC, useState } from 'react'

import { styled } from 'styled-components'

const Button = styled.button`
	padding: 10px 20px;
	background-color: blue;
`

const App: FC = () => {
	const [Count, SetCount] = useState(0)

	return (
		<div>
			Lorem ipsum dolor sit amet, consectetur adipisicing elit. Sunt
			repellendus aliquid necessitatibus ad inventore, obcaecati
			voluptatum numquam, pariatur modi dolorem tenetur dolor saepe
			expedita voluptas officiis itaque perferendis consequuntur illum
			dolorum asperiores. Enim omnis esse laboriosam fugiat, vel possimus
			necessitatibus suscipit in fugit dolorum veritatis ipsa! Dolorem
			recusandae quidem animi perspiciatis reprehenderit veniam eius
			obcaecati molestiae ullam dolorum necessitatibus dolore sit neque
			alias ratione, qui provident nesciunt corrupti officiis ipsa commodi
			vel cupiditate quibusdam? Corrupti dolorum, voluptatem odio
			reprehenderit eaque modi tempora asperiores quos voluptates facilis
			laudantium dolores eligendi deserunt officiis rem ea? Architecto
			officia exercitationem optio, molestias porro sit?
			<Button
				onClick={() => {
					console.log('Clicked')
					SetCount(prev => prev + 1)
				}}
			>
				{Count}
			</Button>
		</div>
	)
}

export default App
