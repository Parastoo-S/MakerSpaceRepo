class RepositoriesController < SessionsController
  before_action :current_user
  before_action :signed_in, except: [:index]
  before_action :github_client, only: [:create, :show]
  before_action :set_repository, only: [:show, :add_like]

  def index
    @repositories = Repository.all
  end

  def show
    @photos = @repository.photos.first(5)
  end

  def new
    @repository = Repository.new
  end
  
  def edit
  end

  def create
    @repository = @user.repositories.build(repository_params)
    @client = github_client
    @files = params['files']

    if @repository.github.present?
      @client.create @repository.github, {description: @repository.description}
      @client.create_contents("#{@client.login}/#{@repository.github}", 
                              "README.md",
                              "Commit README.md",
                              "##{@repository.github}")
      commit if @files.present?
    end

    if @repository.save
      create_photos
      render json: { redirect_uri: "#{user_repository_path(user_id: @user.id, id: @repository.id)}" }
    else
      render :new, alert: "Something went wrong"
    end
  end

  def update
    respond_to do |format|
      if @repository.update(repository_params)
        format.html { redirect_to @repository, notice: 'Repository was successfully updated.' }
        format.json { render :show, status: :ok, location: @repository }
      else
        format.html { render :edit }
        format.json { render json: @repository.errors, status: :unprocessable_entity }
      end
    end
  end

  def destroy
    @repository.destroy
    respond_to do |format|
      format.html { redirect_to repositories_url, notice: 'Repository was successfully destroyed.' }
      format.json { head :no_content }
    end
  end

  def add_like

    like = Like.create({user_id: @user.id, repository_id: @repository.id})
    if like.valid?
      @repository.increment!(:likes)
      render 'template/add_like'
    else
      render nothing: true
    end

  end

  private

    def set_repository
      @repository = Repository.find(params[:id])
    end

    def repository_params
      params.require(:repository).permit(:title, :description, :category, :license, :user_id, :github)
    end

    def create_photos
      params['images'].each do |i|
        dimension = FastImage.size(i.tempfile)
        Photo.create(image: i, repository_id: @repository.id, width: dimension.first, height: dimension.last)
      end if params['images'].present?
    end

    def commit
      repo = "#{@client.login}/#{@repository.github}"
      ref = "heads/master"
      blob_hash_array = []

      sha_latest_commit = @client.ref(repo, ref).object.sha
      sha_base_tree = @client.commit(repo, sha_latest_commit).commit.tree.sha

      @files.each do |f|
        blob_sha = @client.create_blob(repo, Base64.encode64(f.tempfile.read), "base64")
        blob_hash_array.push({ path: f.original_filename, mode: "100644", type: "blob", sha: blob_sha })
      end

      sha_new_tree = @client.create_tree( repo, blob_hash_array, {base_tree: sha_base_tree } ).sha
      commit_message = "Committed via MakerSpaceRepo!"
      sha_new_commit = @client.create_commit(repo, commit_message, sha_new_tree, sha_latest_commit).sha
      updated_ref = @client.update_ref(repo, ref, sha_new_commit)
    end

end

