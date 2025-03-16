Configuring a publishing source for your GitHub Pages site
You can configure your GitHub Pages site to publish when changes are pushed to a specific branch, or you can write a GitHub Actions workflow to publish your site.

Who can use this feature?
People with admin or maintainer permissions for a repository can configure a publishing source for a GitHub Pages site.

GitHub Pages is available in public repositories with GitHub Free and GitHub Free for organizations, and in public and private repositories with GitHub Pro, GitHub Team, GitHub Enterprise Cloud, and GitHub Enterprise Server. For more information, see GitHub’s plans.

GitHub Pages now uses GitHub Actions to execute the Jekyll build. When using a branch as the source of your build, GitHub Actions must be enabled in your repository if you want to use the built-in Jekyll workflow. Alternatively, if GitHub Actions is unavailable or disabled, adding a .nojekyll file to the root of your source branch will bypass the Jekyll build process and deploy the content directly. For more information on enabling GitHub Actions, see Managing GitHub Actions settings for a repository.

In this article
About publishing sources
Publishing from a branch
Publishing with a custom GitHub Actions workflow
About publishing sources
You can publish your site when changes are pushed to a specific branch, or you can write a GitHub Actions workflow to publish your site.

If you do not need any control over the build process for your site, we recommend that you publish your site when changes are pushed to a specific branch. You can specify which branch and folder to use as your publishing source. The source branch can be any branch in your repository, and the source folder can either be the root of the repository (/) on the source branch or a /docs folder on the source branch. Whenever changes are pushed to the source branch, the changes in the source folder will be published to your GitHub Pages site.

If you want to use a build process other than Jekyll or you do not want a dedicated branch to hold your compiled static files, we recommend that you write a GitHub Actions workflow to publish your site. GitHub provides workflow templates for common publishing scenarios to help you write your workflow.

Warning

GitHub Pages sites are publicly available on the internet, even if the repository for the site is private (if your plan or organization allows it). If you have sensitive data in your site's repository, you may want to remove the data before publishing. For more information, see About repositories.

Publishing from a branch
Make sure the branch you want to use as your publishing source already exists in your repository.

On GitHub, navigate to your site's repository.

Under your repository name, click  Settings. If you cannot see the "Settings" tab, select the  dropdown menu, then click Settings.

Screenshot of a repository header showing the tabs. The "Settings" tab is highlighted by a dark orange outline.
In the "Code and automation" section of the sidebar, click  Pages.

Under "Build and deployment", under "Source", select Deploy from a branch.

Under "Build and deployment", use the branch dropdown menu and select a publishing source.

Screenshot of Pages settings in a GitHub repository. A menu to select a branch for a publishing source, labeled "None," is outlined in dark orange.
Optionally, use the folder dropdown menu to select a folder for your publishing source.

Screenshot of Pages settings in a GitHub repository. A menu to select a folder for a publishing source, labeled "/(root)," is outlined in dark orange.
Click Save.

Troubleshooting publishing from a branch
Note

If your repository contains symbolic links, you will need to publish your site using a GitHub Actions workflow. For more information about GitHub Actions, see GitHub Actions documentation.

Note

If you are publishing from a branch and your site has not published automatically, make sure someone with admin permissions and a verified email address has pushed to the publishing source.
Commits pushed by a GitHub Actions workflow that uses the GITHUB_TOKEN do not trigger a GitHub Pages build.
If you choose the docs folder on any branch as your publishing source, then later remove the /docs folder from that branch in your repository, your site won't build and you'll get a page build error message for a missing /docs folder. For more information, see Troubleshooting Jekyll build errors for GitHub Pages sites.

Your GitHub Pages site will always be deployed with a GitHub Actions workflow run, even if you've configured your GitHub Pages site to be built using a different CI tool. Most external CI workflows "deploy" to GitHub Pages by committing the build output to the gh-pages branch of the repository, and typically include a .nojekyll file. When this happens, the GitHub Actions workflow will detect the state that the branch does not need a build step, and will execute only the steps necessary to deploy the site to GitHub Pages servers.

To find potential errors with either the build or deployment, you can check the workflow run for your GitHub Pages site by reviewing your repository's workflow runs. For more information, see Viewing workflow run history. For more information about how to re-run the workflow in case of an error, see Re-running workflows and jobs.

Publishing with a custom GitHub Actions workflow
To configure your site to publish with GitHub Actions:

On GitHub, navigate to your site's repository.

Under your repository name, click  Settings. If you cannot see the "Settings" tab, select the  dropdown menu, then click Settings.

Screenshot of a repository header showing the tabs. The "Settings" tab is highlighted by a dark orange outline.
In the "Code and automation" section of the sidebar, click  Pages.

Under "Build and deployment", under "Source", select GitHub Actions.

GitHub will suggest several workflow templates. If you already have a workflow to publish your site, you can skip this step. Otherwise, choose one of the options to create a GitHub Actions workflow. For more information about creating your custom workflow, see Creating a custom GitHub Actions workflow to publish your site.

GitHub Pages does not associate a specific workflow to the GitHub Pages settings. However, the GitHub Pages settings will link to the workflow run that most recently deployed your site.

Creating a custom GitHub Actions workflow to publish your site
For more information about GitHub Actions, see GitHub Actions documentation.

When you configure your site to publish with GitHub Actions, GitHub will suggest workflow templates for common publishing scenarios. The general flow of a workflow is to:

Trigger whenever there is a push to the default branch of the repository or whenever the workflow is run manually from the Actions tab.
Use the actions/checkout action to check out the repository contents.
If required by your site, build any static site files.
Use the actions/upload-pages-artifact action to upload the static files as an artifact.
If the workflow was triggered by a push to the default branch, use the actions/deploy-pages action to deploy the artifact. This step is skipped if the workflow was triggered by a pull request.
The workflow templates use a deployment environment called github-pages. If your repository does not already include an environment called github-pages, the environment will be created automatically. We recommend that you add a deployment protection rule so that only the default branch can deploy to this environment. For more information, see Managing environments for deployment.

Note

A CNAME file in your repository file does not automatically add or remove a custom domain. Instead, you must configure the custom domain through your repository settings or through the API. For more information, see Managing a custom domain for your GitHub Pages site and REST API endpoints for GitHub Pages.

Troubleshooting publishing with a custom GitHub Actions workflow
For information about how to troubleshoot your GitHub Actions workflow, see Monitoring and troubleshooting workflows.

Creating a GitHub Pages site
You can create a GitHub Pages site in a new or existing repository.

Who can use this feature?
GitHub Pages is available in public repositories with GitHub Free and GitHub Free for organizations, and in public and private repositories with GitHub Pro, GitHub Team, GitHub Enterprise Cloud, and GitHub Enterprise Server. For more information, see GitHub’s plans.

GitHub Pages now uses GitHub Actions to execute the Jekyll build. When using a branch as the source of your build, GitHub Actions must be enabled in your repository if you want to use the built-in Jekyll workflow. Alternatively, if GitHub Actions is unavailable or disabled, adding a .nojekyll file to the root of your source branch will bypass the Jekyll build process and deploy the content directly. For more information on enabling GitHub Actions, see Managing GitHub Actions settings for a repository.

In this article
Creating a repository for your site
Creating your site
Next steps
Further reading
Note

Organization owners can restrict the publication of GitHub Pages sites from repositories owned by the organization. For more information, see Managing the publication of GitHub Pages sites for your organization.

Creating a repository for your site
You can either create a repository or choose an existing repository for your site.

If you want to create a GitHub Pages site for a repository where not all of the files in the repository are related to the site, you will be able to configure a publishing source for your site. For example, you can have a dedicated branch and folder to hold your site source files, or you can use a custom GitHub Actions workflow to build and deploy your site source files.

If the account that owns the repository uses GitHub Free or GitHub Free for organizations, the repository must be public.

If you want to create a site in an existing repository, skip to the Creating your site section.

In the upper-right corner of any page, select , then click New repository.

Screenshot of a GitHub dropdown menu showing options to create new items. The menu item "New repository" is outlined in dark orange.
Use the Owner dropdown menu to select the account you want to own the repository.

Screenshot of the owner menu for a new GitHub repository. The menu shows two options, octocat and github.
Type a name for your repository and an optional description. If you're creating a user or organization site, your repository must be named <user>.github.io or <organization>.github.io. If your user or organization name contains uppercase letters, you must lowercase the letters. For more information, see About GitHub Pages.

Screenshot of GitHub Pages settings in a repository. The repository name field contains the text "octocat.github.io" and is outlined in dark orange.
Choose a repository visibility. For more information, see About repositories.

Select Initialize this repository with a README.

Click Create repository.

Creating your site
Before you can create your site, you must have a repository for your site on GitHub. If you're not creating your site in an existing repository, see Creating a repository for your site.

Warning

GitHub Pages sites are publicly available on the internet, even if the repository for the site is private (if your plan or organization allows it). If you have sensitive data in your site's repository, you may want to remove the data before publishing. For more information, see About repositories.

On GitHub, navigate to your site's repository.

Decide which publishing source you want to use. For more information, see Configuring a publishing source for your GitHub Pages site.

Create the entry file for your site. GitHub Pages will look for an index.html, index.md, or README.md file as the entry file for your site.

If your publishing source is a branch and folder, the entry file must be at the top level of the source folder on the source branch. For example, if your publishing source is the /docs folder on the main branch, your entry file must be located in the /docs folder on a branch called main.

If your publishing source is a GitHub Actions workflow, the artifact that you deploy must include the entry file at the top level of the artifact. Instead of adding the entry file to your repository, you may choose to have your GitHub Actions workflow generate your entry file when the workflow runs.

Configure your publishing source. For more information, see Configuring a publishing source for your GitHub Pages site.

Under your repository name, click  Settings. If you cannot see the "Settings" tab, select the  dropdown menu, then click Settings.

Screenshot of a repository header showing the tabs. The "Settings" tab is highlighted by a dark orange outline.
In the "Code and automation" section of the sidebar, click  Pages.

To see your published site, under "GitHub Pages", click  Visit site.

Screenshot of a confirmation message for GitHub Pages listing the site's URL. The gray "Visit site" button is outlined in orange.
Note

It can take up to 10 minutes for changes to your site to publish after you push the changes to GitHub. If you don't see your GitHub Pages site changes reflected in your browser after an hour, see About Jekyll build errors for GitHub Pages sites.

Your GitHub Pages site is built and deployed with a GitHub Actions workflow. For more information, see Viewing workflow run history.

Note

GitHub Actions is free for public repositories. Usage charges apply for private and internal repositories that go beyond the monthly allotment of free minutes. For more information, see Usage limits, billing, and administration.

Note

If you are publishing from a branch and your site has not published automatically, make sure someone with admin permissions and a verified email address has pushed to the publishing source.
Commits pushed by a GitHub Actions workflow that uses the GITHUB_TOKEN do not trigger a GitHub Pages build.
Next steps
You can add more pages to your site by creating more new files. Each file will be available on your site in the same directory structure as your publishing source. For example, if the publishing source for your project site is the gh-pages branch, and you create a new file called /about/contact-us.md on the gh-pages branch, the file will be available at https://<user>.github.io/<repository>/about/contact-us.html.

You can also add a theme to customize your site’s look and feel. For more information, see Adding a theme to your GitHub Pages site using Jekyll.

To customize your site even more, you can use Jekyll, a static site generator with built-in support for GitHub Pages. For more information, see About GitHub Pages and Jekyll.

Troubleshooting 404 errors for GitHub Pages sites
This guide will help you troubleshoot common reasons you may be seeing a 404 error.

Who can use this feature?
GitHub Pages is available in public repositories with GitHub Free and GitHub Free for organizations, and in public and private repositories with GitHub Pro, GitHub Team, GitHub Enterprise Cloud, and GitHub Enterprise Server. For more information, see GitHub’s plans.

GitHub Pages now uses GitHub Actions to execute the Jekyll build. When using a branch as the source of your build, GitHub Actions must be enabled in your repository if you want to use the built-in Jekyll workflow. Alternatively, if GitHub Actions is unavailable or disabled, adding a .nojekyll file to the root of your source branch will bypass the Jekyll build process and deploy the content directly. For more information on enabling GitHub Actions, see Managing GitHub Actions settings for a repository.

Troubleshooting 404 errors
In this guide you'll find common reasons you may be seeing a 404 error while building your GitHub Pages site.

GitHub's Status page
DNS setup
Browser cache
index.html file
Directory contents
Custom domain
Repository
GitHub's Status page
If you see a 404 error while building a GitHub Pages site, first check GitHub's Status page for any active incidents.

DNS setup
Make sure GitHub's DNS records are set up correctly with your DNS provider. For more information, see Managing a custom domain for your GitHub Pages site.

Browser cache
If your GitHub Pages site is private and you see a 404 error, you may need to clear your browser's cache. For more information on clearing your cache, see your browser's documentation.

index.html file
GitHub Pages will look for an index.html file as the entry file for your site.

Make sure you have an index.html file in the repository for your site on GitHub. For more information, see Creating a GitHub Pages site.

The entry file must be at the top level of your chosen publishing source. For example, if your publishing source is the /docs directory on the main branch, your entry file must be located in the /docs directory on a branch called main.

If your publishing source is a branch and directory, the entry file must be at the top level of the source directory on the source branch. For example, if your publishing source is the /docs directory on the main branch, your entry file must be located in the /docs directory on a branch called main.

If your publishing source is a GitHub Actions workflow, the artifact that you deploy must include the entry file at the top level of the artifact. Instead of adding the entry file to your repository, you may choose to have your GitHub Actions workflow generate your entry file when the workflow runs.

The name of the index.html file is case sensitive. For example, Index.html will not work.

The name of the file should be index.html, not index.HTML or any other variation.

Directory contents
Check that your directory contents are in the root directory.

Custom domain
If you're using a custom domain, make sure it's set up correctly. For more information, see About custom domains and GitHub Pages.

The CNAME record should always point to <USER>.github.io or <ORGANIZATION>.github.io, excluding the repository name. For more information about how to create the correct record, see your DNS provider's documentation.
If you are able to access your landing page, but encounter broken links throughout, it is likely because you either didn't have a custom domain name before or are reverting back from having a custom domain name. In such cases, changing the routing path does not initiate a rebuild of the page. The recommended solution is to ensure that your site rebuilds automatically when adding or removing a custom domain name. This may involve configuring a commit author and modifying the custom domain name settings.
Repository
Check whether your repository meets the following requirements.

The branch you are using to publish your site must be the main or default branch.
The repository must have a commit pushed to it by someone with admin permissions for the repository, such as the repository owner.
Switching the repository's visibility from public to private or vice versa will change the URL of your GitHub Pages site, which will result in broken links until the site is rebuilt.
If you are using a private repository for the GitHub Pages site, please check if your GitHub Pro, GitHub Team, or GitHub Enterprise Cloud subscription is still active. If you renew the plan, the GitHub Pages site will be automatically re-deployed. Otherwise, you can change your repository's visibility to public to continue using GitHub Pages for free.