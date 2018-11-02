module.exports = {
	cliModules:{
		GitNodeProject: require('./src/cli-modules/git-node-project/NodeProject.cli'),
		Vulgar: require('./src/cli-modules/Vulgar/Vulgar.cli')
	},
	generators: {
		HandlebarsFileSourceGenerator: require('./src/generators/HandlebarsFileSourceGenerator'),
		RawFileSourceGenerator: require('./src/generators/RawFileSourceGenerator'),
		SourceGenerator: require('./src/generators/SourceGenerator')
	},
	scaffolders: {
		BaseScaffolder: require('./src/scaffolders/BaseScaffolder'),
		FileScaffolder: require('./src/scaffolders/FileScaffolder')
	}
};